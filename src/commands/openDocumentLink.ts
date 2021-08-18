/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import path from "path";
import {
  commands,
  TextEditor,
  Uri,
  window,
  workspace,
  Range,
  TextEditorRevealType,
  Selection,
} from "vscode";

import { Command } from "../commandManager";
import { isGIFTFile } from "../util/file";

export interface OpenDocumentLinkArgs {
  path: string;
  fragment: string;
}

export class OpenDocumentLinkCommand implements Command {
  private static readonly id = "_gift.openDocumentLink";
  public readonly id = OpenDocumentLinkCommand.id;

  public static createCommandUri(path: string, fragment: string): Uri {
    return Uri.parse(
      `command:${OpenDocumentLinkCommand.id}?${encodeURIComponent(
        JSON.stringify({ path, fragment })
      )}`
    );
  }

  public execute(args: OpenDocumentLinkArgs): Promise<void> {
    const p = decodeURIComponent(args.path);
    return this.tryOpen(p, args).catch(() => {
      if (path.extname(p) === "") {
        return this.tryOpen(p + ".md", args);
      }
      const resource = Uri.file(p);
      return Promise.resolve(void 0)
        .then(() => commands.executeCommand("vscode.open", resource))
        .then(() => void 0);
    });
  }

  private async tryOpen(path: string, args: OpenDocumentLinkArgs) {
    const resource = Uri.file(path);
    if (
      window.activeTextEditor &&
      isGIFTFile(window.activeTextEditor.document) &&
      window.activeTextEditor.document.uri.fsPath === resource.fsPath
    ) {
      return this.tryRevealLine(window.activeTextEditor, args.fragment);
    } else {
      return workspace
        .openTextDocument(resource)
        .then(window.showTextDocument)
        .then((editor) => this.tryRevealLine(editor, args.fragment));
    }
  }

  private async tryRevealLine(editor: TextEditor, fragment?: string) {
    if (editor && fragment) {
      const lineNumberFragment = fragment.match(/^L(\d+)$/i);
      if (lineNumberFragment) {
        const line = +lineNumberFragment[1] - 1;
        if (!isNaN(line)) {
          const lineStart = new Range(line, 0, line, 0);
          editor.selection = new Selection(lineStart.start, lineStart.end);
          return editor.revealRange(lineStart, TextEditorRevealType.AtTop);
        }
      }
    }
  }
}
