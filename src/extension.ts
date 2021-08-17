/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ExtensionContext, workspace } from "vscode";
import { CommandManager } from "./commandManager";
import {
  MoveCursorToPositionCommand,
  OpenDocumentLinkCommand,
  RefreshPreviewCommand,
  ShowLockedPreviewToSideCommand,
  ShowPreviewCommand,
  ShowPreviewSecuritySelectorCommand,
  ShowPreviewToSideCommand,
  ShowSourceCommand,
  ToggleLockCommand,
} from "./commands/index";
import { GIFTContentProvider } from "./features/previewContentProvider";
import { GIFTPreviewManager } from "./features/previewManager";
import { Logger } from "./logger";
import {
  ExtensionContentSecurityPolicyArbiter,
  PreviewSecuritySelector,
} from "./security";

let extensionPath = "";

export function getExtensionPath(): string {
  return extensionPath;
}

export function activate(context: ExtensionContext): void {
  extensionPath = context.extensionPath;

  const cspArbiter = new ExtensionContentSecurityPolicyArbiter(
    context.globalState,
    context.workspaceState
  );
  const logger = new Logger();

  const contentProvider = new GIFTContentProvider(context, cspArbiter, logger);
  const previewManager = new GIFTPreviewManager(contentProvider, logger);
  context.subscriptions.push(previewManager);

  const previewSecuritySelector = new PreviewSecuritySelector(
    cspArbiter,
    previewManager
  );

  const commandManager = new CommandManager();
  context.subscriptions.push(commandManager);
  commandManager.register(new ShowPreviewCommand(previewManager));
  commandManager.register(new ShowPreviewToSideCommand(previewManager));
  commandManager.register(new ShowLockedPreviewToSideCommand(previewManager));
  commandManager.register(new ShowSourceCommand(previewManager));
  commandManager.register(new RefreshPreviewCommand(previewManager));
  commandManager.register(new MoveCursorToPositionCommand());
  commandManager.register(
    new ShowPreviewSecuritySelectorCommand(
      previewSecuritySelector,
      previewManager
    )
  );
  commandManager.register(new OpenDocumentLinkCommand());
  commandManager.register(new ToggleLockCommand(previewManager));

  context.subscriptions.push(
    workspace.onDidChangeConfiguration(() => {
      logger.updateConfiguration();
      previewManager.updateConfiguration();
    })
  );
}
