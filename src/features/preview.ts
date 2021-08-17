/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import {
  Uri,
  WebviewPanel,
  Disposable,
  ViewColumn,
  window,
  commands,
  workspace,
  EventEmitter,
  WebviewPanelOnDidChangeViewStateEvent,
  Range,
  WebviewOptions,
  TextEditorRevealType,
  Position,
  Selection,
} from "vscode";
import path from "path";

import { Logger } from "../logger";
import { GIFTContentProvider } from "./previewContentProvider";
import { disposeAll } from "../util/dispose";

import * as nls from "vscode-nls";
import {
  getVisibleLine,
  GIFTFileTopmostLineMonitor,
} from "../util/topmostLineMonitor";
import { GIFTPreviewConfigurationManager } from "./previewConfig";
import { isGIFTFile } from "../util/file";
import { getExtensionPath } from "../extension";

const localize = nls.loadMessageBundle();

export class GIFTPreview {
  public static viewType = "gift.preview";

  private _resource: Uri;
  private _locked: boolean;

  private readonly editor: WebviewPanel;
  private throttleTimer: any;
  private line: number | undefined = undefined;
  private readonly disposables: Disposable[] = [];
  private firstUpdate = true;
  private currentVersion?: { resource: Uri; version: number };
  private forceUpdate = false;
  private isScrolling = false;
  private _disposed = false;

  public static async revive(
    webview: WebviewPanel,
    state: { resource: string; locked: boolean; line: number },
    contentProvider: GIFTContentProvider,
    previewConfigurations: GIFTPreviewConfigurationManager,
    logger: Logger,
    topmostLineMonitor: GIFTFileTopmostLineMonitor
  ): Promise<GIFTPreview> {
    const resource = Uri.parse(state.resource);
    const locked = state.locked;
    const line = state.line;

    const preview = new GIFTPreview(
      webview,
      resource,
      locked,
      contentProvider,
      previewConfigurations,
      logger,
      topmostLineMonitor
    );

    preview.editor.webview.options = GIFTPreview.getWebviewOptions(resource);

    if (!isNaN(line)) {
      preview.line = line;
    }
    await preview.doUpdate();
    return preview;
  }

  public static create(
    resource: Uri,
    previewColumn: ViewColumn,
    locked: boolean,
    contentProvider: GIFTContentProvider,
    previewConfigurations: GIFTPreviewConfigurationManager,
    logger: Logger,
    topmostLineMonitor: GIFTFileTopmostLineMonitor
  ): GIFTPreview {
    const webview = window.createWebviewPanel(
      GIFTPreview.viewType,
      GIFTPreview.getPreviewTitle(resource, locked),
      previewColumn,
      {
        enableFindWidget: true,
        ...GIFTPreview.getWebviewOptions(resource),
      }
    );

    return new GIFTPreview(
      webview,
      resource,
      locked,
      contentProvider,
      previewConfigurations,
      logger,
      topmostLineMonitor
    );
  }

  private constructor(
    webview: WebviewPanel,
    resource: Uri,
    locked: boolean,
    private readonly _contentProvider: GIFTContentProvider,
    private readonly _previewConfigurations: GIFTPreviewConfigurationManager,
    private readonly _logger: Logger,
    topmostLineMonitor: GIFTFileTopmostLineMonitor
  ) {
    this._resource = resource;
    this._locked = locked;
    this.editor = webview;

    this.editor.onDidDispose(
      () => {
        this.dispose();
      },
      null,
      this.disposables
    );

    this.editor.onDidChangeViewState(
      (e) => {
        this._onDidChangeViewStateEmitter.fire(e);
      },
      null,
      this.disposables
    );

    this.editor.webview.onDidReceiveMessage(
      (e) => {
        if (e.source !== this._resource.toString()) {
          return;
        }

        switch (e.type) {
          case "command":
            commands.executeCommand(e.body.command, ...e.body.args);
            break;

          case "revealLine":
            this.onDidScrollPreview(e.body.line);
            break;

          case "didClick":
            this.onDidClickPreview(e.body.line);
            break;
        }
      },
      null,
      this.disposables
    );

    workspace.onDidChangeTextDocument(
      (event) => {
        if (this.isPreviewOf(event.document.uri)) {
          this.refresh();
        }
      },
      null,
      this.disposables
    );

    topmostLineMonitor.onDidChangeTopmostLine(
      (event) => {
        if (this.isPreviewOf(event.resource)) {
          this.updateForView(event.resource, event.line);
        }
      },
      null,
      this.disposables
    );

    window.onDidChangeTextEditorSelection(
      (event) => {
        if (this.isPreviewOf(event.textEditor.document.uri)) {
          this.postMessage({
            type: "onDidChangeTextEditorSelection",
            line: event.selections[0].active.line,
            source: this.resource.toString(),
          });
        }
      },
      null,
      this.disposables
    );

    window.onDidChangeActiveTextEditor(
      (editor) => {
        if (editor && isGIFTFile(editor.document) && !this._locked) {
          this.update(editor.document.uri);
        }
      },
      null,
      this.disposables
    );
  }

  private readonly _onDisposeEmitter = new EventEmitter<void>();
  public readonly onDispose = this._onDisposeEmitter.event;

  private readonly _onDidChangeViewStateEmitter =
    new EventEmitter<WebviewPanelOnDidChangeViewStateEvent>();
  public readonly onDidChangeViewState =
    this._onDidChangeViewStateEmitter.event;

  public get resource(): Uri {
    return this._resource;
  }

  public get state(): {
    resource: string;
    locked: boolean;
    line: number | undefined;
  } {
    return {
      resource: this.resource.toString(),
      locked: this._locked,
      line: this.line,
    };
  }

  public dispose(): void {
    if (this._disposed) {
      return;
    }

    this._disposed = true;
    this._onDisposeEmitter.fire();

    this._onDisposeEmitter.dispose();
    this._onDidChangeViewStateEmitter.dispose();
    this.editor.dispose();

    disposeAll(this.disposables);
  }

  public update(resource: Uri): void {
    const editor = window.activeTextEditor;
    if (editor && editor.document.uri.fsPath === resource.fsPath) {
      this.line = getVisibleLine(editor);
    }

    // If we have changed resources, cancel any pending updates
    const isResourceChange = resource.fsPath !== this._resource.fsPath;
    if (isResourceChange) {
      this.forceUpdate = true;
      clearTimeout(this.throttleTimer);
      this.throttleTimer = undefined;
    }

    this._resource = resource;

    // Schedule update if none is pending
    if (!this.throttleTimer) {
      if (isResourceChange || this.firstUpdate) {
        this.doUpdate();
      } else {
        this.throttleTimer = setTimeout(() => this.doUpdate(), 40);
      }
    }

    this.firstUpdate = false;
  }

  public refresh(): void {
    this.update(this._resource);
  }

  public updateConfiguration(): void {
    if (this._previewConfigurations.hasConfigurationChanged(this._resource)) {
      this.refresh();
    }
  }

  public get position(): ViewColumn | undefined {
    return this.editor.viewColumn;
  }

  public matchesResource(
    otherResource: Uri,
    otherPosition: ViewColumn | undefined,
    otherLocked: boolean
  ): boolean {
    if (this.position !== otherPosition) {
      return false;
    }

    if (this._locked) {
      return otherLocked && this.isPreviewOf(otherResource);
    } else {
      return !otherLocked;
    }
  }

  public matches(otherPreview: GIFTPreview): boolean {
    return this.matchesResource(
      otherPreview._resource,
      otherPreview.position,
      otherPreview._locked
    );
  }

  public reveal(viewColumn: ViewColumn): void {
    this.editor.reveal(viewColumn);
  }

  public toggleLock(): void {
    this._locked = !this._locked;
    this.editor.title = GIFTPreview.getPreviewTitle(
      this._resource,
      this._locked
    );
  }

  private get iconPath() {
    const root = path.join(getExtensionPath(), "media");
    return {
      light: Uri.file(path.join(root, "Preview.svg")),
      dark: Uri.file(path.join(root, "Preview_inverse.svg")),
    };
  }

  private isPreviewOf(resource: Uri): boolean {
    return this._resource.fsPath === resource.fsPath;
  }

  private static getPreviewTitle(resource: Uri, locked: boolean): string {
    return locked
      ? localize(
          "lockedPreviewTitle",
          "[Preview] {0}",
          path.basename(resource.fsPath)
        )
      : localize("previewTitle", "Preview {0}", path.basename(resource.fsPath));
  }

  private updateForView(resource: Uri, topLine: number | undefined) {
    if (!this.isPreviewOf(resource)) {
      return;
    }

    if (this.isScrolling) {
      this.isScrolling = false;
      return;
    }

    if (typeof topLine === "number") {
      this._logger.log("updateForView", { htmlFile: resource });
      this.line = topLine;
      this.postMessage({
        type: "updateView",
        line: topLine,
        source: resource.toString(),
      });
    }
  }

  private postMessage(msg: any) {
    if (!this._disposed) {
      this.editor.webview.postMessage(msg);
    }
  }

  private async doUpdate(): Promise<void> {
    const resource = this._resource;

    clearTimeout(this.throttleTimer);
    this.throttleTimer = undefined;

    const document = await workspace.openTextDocument(resource);
    if (
      !this.forceUpdate &&
      this.currentVersion &&
      this.currentVersion.resource.fsPath === resource.fsPath &&
      this.currentVersion.version === document.version
    ) {
      if (this.line) {
        this.updateForView(resource, this.line);
      }
      return;
    }

    this.currentVersion = { resource, version: document.version };
    const content = await this._contentProvider.provideTextDocumentContent(
      document,
      this._previewConfigurations,
      this.line,
      this.state
    );
    if (this._resource === resource) {
      this.editor.title = GIFTPreview.getPreviewTitle(
        this._resource,
        this._locked
      );
      this.editor.iconPath = this.iconPath;
      this.editor.webview.options = GIFTPreview.getWebviewOptions(resource);
      if (!this.editor.webview.html || this.forceUpdate) {
        this.editor.webview.html = content.head + content.body;
      } else {
        this.postMessage({
          type: "updateHTML",
          html: content.body,
          state: content.blankState,
          source: this.resource.toString(),
        });
      }
    }

    this.forceUpdate = false;
  }

  private static getWebviewOptions(resource: Uri): WebviewOptions {
    return {
      enableScripts: true,
      enableCommandUris: true,
      localResourceRoots: GIFTPreview.getLocalResourceRoots(resource),
    };
  }

  private static getLocalResourceRoots(resource: Uri): Uri[] {
    const baseRoots: Uri[] = [Uri.file(getExtensionPath() + "/media")];

    const folder = workspace.getWorkspaceFolder(resource);
    if (folder) {
      return baseRoots.concat(folder.uri);
    }

    if (!resource.scheme || resource.scheme === "file") {
      return baseRoots.concat(Uri.file(path.dirname(resource.fsPath)));
    }

    return baseRoots;
  }

  private onDidScrollPreview(line: number) {
    this.line = line;
    for (const editor of window.visibleTextEditors) {
      if (!this.isPreviewOf(editor.document.uri)) {
        continue;
      }

      this.isScrolling = true;
      const sourceLine = Math.floor(line);
      const fraction = line - sourceLine;
      const text = editor.document.lineAt(sourceLine).text;
      const start = Math.floor(fraction * text.length);
      editor.revealRange(
        new Range(sourceLine, start, sourceLine + 1, 0),
        TextEditorRevealType.AtTop
      );
    }
  }

  private async onDidClickPreview(line: number): Promise<void> {
    for (const visibleEditor of window.visibleTextEditors) {
      if (this.isPreviewOf(visibleEditor.document.uri)) {
        const editor = await window.showTextDocument(
          visibleEditor.document,
          visibleEditor.viewColumn
        );
        const position = new Position(line, 0);
        editor.selection = new Selection(position, position);
        return;
      }
    }

    workspace.openTextDocument(this._resource).then(window.showTextDocument);
  }
}

export interface PreviewSettings {
  readonly resourceColumn: ViewColumn;
  readonly previewColumn: ViewColumn;
  readonly locked: boolean;
}
