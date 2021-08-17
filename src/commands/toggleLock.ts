/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Command } from "../commandManager";
import { GIFTPreviewManager } from "../features/previewManager";

export class ToggleLockCommand implements Command {
  public readonly id = "gift.preview.toggleLock";

  public constructor(private readonly previewManager: GIFTPreviewManager) {}

  public execute(): void {
    this.previewManager.toggleLock();
  }
}
