/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, commands } from "vscode";

export interface Command {
  readonly id: string;

  execute(...args: any[]): void;
}

export class CommandManager {
  private readonly commands = new Map<string, Disposable>();

  public dispose(): void {
    for (const registration of this.commands.values()) {
      registration.dispose();
    }
    this.commands.clear();
  }

  public register<T extends Command>(command: T): T {
    if (this.commands.has(command.id)) {
      return command;
    }

    this.commands.set(
      command.id,
      commands.registerCommand(command.id, command.execute, command)
    );
    return command;
  }
}
