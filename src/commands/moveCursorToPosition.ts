/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Position, window, Selection } from "vscode";

import { Command } from "../commandManager";

export class MoveCursorToPositionCommand implements Command {
  public readonly id = "_gift.moveCursorToPosition";

  public execute(line: number, character: number): void {
    if (window.activeTextEditor) {
      const position = new Position(line, character);
      const selection = new Selection(position, position);
      window.activeTextEditor.revealRange(selection);
      window.activeTextEditor.selection = selection;
    }
  }
}
