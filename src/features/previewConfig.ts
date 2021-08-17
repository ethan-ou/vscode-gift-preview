/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { workspace, Uri } from "vscode";

export class GIFTPreviewConfiguration {
  public static getForResource(resource: Uri): GIFTPreviewConfiguration {
    return new GIFTPreviewConfiguration(resource);
  }

  public readonly doubleClickToSwitchToEditor: boolean;
  public readonly scrollEditorWithPreview: boolean;
  public readonly scrollPreviewWithEditor: boolean;
  public readonly markEditorSelection: boolean;

  public readonly styles: string[];

  private constructor(resource: Uri) {
    const editorConfig = workspace.getConfiguration("editor", resource);
    const giftConfig = workspace.getConfiguration("gift", resource);
    const giftEditorConfig = workspace.getConfiguration("[gift]", resource);

    this.scrollPreviewWithEditor = !!giftConfig.get<boolean>(
      "preview.scrollPreviewWithEditor",
      true
    );
    this.scrollEditorWithPreview = !!giftConfig.get<boolean>(
      "preview.scrollEditorWithPreview",
      true
    );
    this.doubleClickToSwitchToEditor = !!giftConfig.get<boolean>(
      "preview.doubleClickToSwitchToEditor",
      true
    );
    this.markEditorSelection = !!giftConfig.get<boolean>(
      "preview.markEditorSelection",
      true
    );

    this.styles = giftConfig.get<string[]>("styles", []);
  }

  public isEqualTo(otherConfig: GIFTPreviewConfiguration): boolean {
    for (const key in this) {
      if (this.hasOwnProperty(key) && key !== "styles") {
        if (this[key] !== otherConfig[key]) {
          return false;
        }
      }
    }

    // Check styles
    if (this.styles.length !== otherConfig.styles.length) {
      return false;
    }
    for (let i = 0; i < this.styles.length; ++i) {
      if (this.styles[i] !== otherConfig.styles[i]) {
        return false;
      }
    }

    return true;
  }

  [key: string]: any;
}

export class GIFTPreviewConfigurationManager {
  private readonly previewConfigurationsForWorkspaces = new Map<
    string,
    GIFTPreviewConfiguration
  >();

  public loadAndCacheConfiguration(resource: Uri): GIFTPreviewConfiguration {
    const config = GIFTPreviewConfiguration.getForResource(resource);
    this.previewConfigurationsForWorkspaces.set(this.getKey(resource), config);
    return config;
  }

  public hasConfigurationChanged(resource: Uri): boolean {
    const key = this.getKey(resource);
    const currentConfig = this.previewConfigurationsForWorkspaces.get(key);
    const newConfig = GIFTPreviewConfiguration.getForResource(resource);
    return !currentConfig || !currentConfig.isEqualTo(newConfig);
  }

  private getKey(resource: Uri): string {
    const folder = workspace.getWorkspaceFolder(resource);
    return folder ? folder.uri.toString() : "";
  }
}
