/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

import { Command } from '../commandManager';
import { GIFTPreviewManager } from '../features/previewManager';
import { PreviewSettings } from '../features/preview';

interface ShowPreviewSettings {
	readonly sideBySide?: boolean;
	readonly locked?: boolean;
}

async function showPreview(
	webviewManager: GIFTPreviewManager,
	uri: vscode.Uri | undefined,
	previewSettings: ShowPreviewSettings,
): Promise<any> {
	let resource = uri;
	if (!(resource instanceof vscode.Uri)) {
		if (vscode.window.activeTextEditor) {
			// we are relaxed and don't check for gift files
			resource = vscode.window.activeTextEditor.document.uri;
		}
	}

	if (!(resource instanceof vscode.Uri)) {
		if (!vscode.window.activeTextEditor) {
			// this is most likely toggling the preview
			return vscode.commands.executeCommand('gift.showSource');
		}
		// nothing found that could be shown or toggled
		return;
	}

	const resourceColumn = (vscode.window.activeTextEditor && vscode.window.activeTextEditor.viewColumn) || vscode.ViewColumn.One;
	webviewManager.preview(resource, {
		resourceColumn: resourceColumn,
		previewColumn: previewSettings.sideBySide ? resourceColumn + 1 : resourceColumn,
		locked: !!previewSettings.locked
	});

}

export class ShowPreviewCommand implements Command {
	public readonly id = 'gift.showPreview';

	public constructor(
		private readonly webviewManager: GIFTPreviewManager,
	) { }

	public execute(mainUri?: vscode.Uri, allUris?: vscode.Uri[], previewSettings?: PreviewSettings) {
		for (const uri of Array.isArray(allUris) ? allUris : [mainUri]) {
			showPreview(this.webviewManager, uri, {
				sideBySide: false,
				locked: previewSettings && previewSettings.locked
			});
		}
	}
}

export class ShowPreviewToSideCommand implements Command {
	public readonly id = 'gift.showPreviewToSide';

	public constructor(
		private readonly webviewManager: GIFTPreviewManager,
	) { }

	public execute(uri?: vscode.Uri, previewSettings?: PreviewSettings) {
		showPreview(this.webviewManager, uri, {
			sideBySide: true,
			locked: previewSettings && previewSettings.locked
		});
	}
}


export class ShowLockedPreviewToSideCommand implements Command {
	public readonly id = 'gift.showLockedPreviewToSide';

	public constructor(
		private readonly webviewManager: GIFTPreviewManager
	) { }

	public execute(uri?: vscode.Uri) {
		showPreview(this.webviewManager, uri, {
			sideBySide: true,
			locked: true
		});
	}
}
