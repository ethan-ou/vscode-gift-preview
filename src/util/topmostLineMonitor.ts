/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { window, Disposable, EventEmitter, Uri, TextEditor } from "vscode";
import { disposeAll } from "../util/dispose";
import { isGIFTFile } from "./file";

export class GIFTFileTopmostLineMonitor {
  private readonly disposables: Disposable[] = [];

  private readonly pendingUpdates = new Map<string, number>();

  private readonly throttle = 50;

  constructor() {
    window.onDidChangeTextEditorVisibleRanges(
      (event) => {
        if (isGIFTFile(event.textEditor.document)) {
          const line = getVisibleLine(event.textEditor);
          if (typeof line === "number") {
            this.updateLine(event.textEditor.document.uri, line);
          }
        }
      },
      null,
      this.disposables
    );
  }

  dispose(): void {
    disposeAll(this.disposables);
  }

  private readonly _onDidChangeTopmostLineEmitter = new EventEmitter<{
    resource: Uri;
    line: number;
  }>();
  public readonly onDidChangeTopmostLine =
    this._onDidChangeTopmostLineEmitter.event;

  private updateLine(resource: Uri, line: number) {
    const key = resource.toString();
    if (!this.pendingUpdates.has(key)) {
      // schedule update
      setTimeout(() => {
        if (this.pendingUpdates.has(key)) {
          this._onDidChangeTopmostLineEmitter.fire({
            resource,
            line: this.pendingUpdates.get(key) as number,
          });
          this.pendingUpdates.delete(key);
        }
      }, this.throttle);
    }

    this.pendingUpdates.set(key, line);
  }
}

/**
 * Get the top-most visible range of `editor`.
 *
 * Returns a fractional line number based the visible character within the line.
 * Floor to get real line number
 */
export function getVisibleLine(editor: TextEditor): number | undefined {
  if (!editor.visibleRanges.length) {
    return undefined;
  }

  const firstVisiblePosition = editor.visibleRanges[0].start;
  const lineNumber = firstVisiblePosition.line;
  const line = editor.document.lineAt(lineNumber);
  const progress = firstVisiblePosition.character / (line.text.length + 2);
  return lineNumber + progress;
}
