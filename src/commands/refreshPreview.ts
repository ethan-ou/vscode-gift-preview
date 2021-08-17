/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Command } from "../commandManager";
import { GIFTPreviewManager } from "../features/previewManager";

export class RefreshPreviewCommand implements Command {
  public readonly id = "gift.preview.refresh";

  public constructor(private readonly webviewManager: GIFTPreviewManager) {}

  public execute(): void {
    this.webviewManager.refresh();
  }
}
