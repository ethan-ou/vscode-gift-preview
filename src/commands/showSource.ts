/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { workspace, window, TextEditor } from "vscode";
import { Command } from "../commandManager";
import { GIFTPreviewManager } from "../features/previewManager";

export class ShowSourceCommand implements Command {
  public readonly id = "gift.showSource";

  public constructor(private readonly previewManager: GIFTPreviewManager) {}

  public execute(): Thenable<TextEditor> | undefined {
    if (this.previewManager.activePreviewResource) {
      return workspace
        .openTextDocument(this.previewManager.activePreviewResource)
        .then((document) => window.showTextDocument(document));
    }
    return undefined;
  }
}
