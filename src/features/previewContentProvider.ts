/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from "path";

import * as nls from "vscode-nls";
const localize = nls.loadMessageBundle();

import { Logger } from "../logger";
import {
  ContentSecurityPolicyArbiter,
  GIFTPreviewSecurityLevel,
} from "../security";
import {
  GIFTPreviewConfigurationManager,
  GIFTPreviewConfiguration,
} from "./previewConfig";
import GIFTParser from "./gift";
import createSnippetPreview from "./snippets";
import { actionButton } from "./ui";
import { ExtensionContext, TextDocument, Uri, workspace } from "vscode";

/**
 * Strings used inside the gift preview.
 *
 * Stored here and then injected in the preview so that they
 * can be localized using our normal localization process.
 */
const previewStrings = {
  cspAlertMessageText: localize(
    "preview.securityMessage.text",
    "Some content has been disabled in this document"
  ),

  cspAlertMessageTitle: localize(
    "preview.securityMessage.title",
    "Potentially unsafe or insecure content has been disabled in the gift preview. Change the gift preview security setting to allow insecure content or enable scripts"
  ),

  cspAlertMessageLabel: localize(
    "preview.securityMessage.label",
    "Content Disabled Security Warning"
  ),
};

export class GIFTContentProvider {
  private GIFTParser: GIFTParser;

  constructor(
    private readonly context: ExtensionContext,
    private readonly cspArbiter: ContentSecurityPolicyArbiter,
    private readonly logger: Logger
  ) {
    this.GIFTParser = new GIFTParser();
  }

  public provideTextDocumentContent(
    giftDocument: TextDocument,
    previewConfigurations: GIFTPreviewConfigurationManager,
    initialLine: number | undefined = undefined,
    state?: any
  ): {
    head: string;
    body: string;
    blankState: boolean;
  } {
    const sourceUri = giftDocument.uri;
    const config = previewConfigurations.loadAndCacheConfiguration(sourceUri);
    const initialData = {
      source: sourceUri.toString(),
      line: initialLine,
      lineCount: giftDocument.lineCount,
      scrollPreviewWithEditor: config.scrollPreviewWithEditor,
      scrollEditorWithPreview: config.scrollEditorWithPreview,
      doubleClickToSwitchToEditor: config.doubleClickToSwitchToEditor,
      disableSecurityWarnings: this.cspArbiter.shouldDisableSecurityWarnings(),
    };

    this.logger.log("provideTextDocumentContent", initialData);

    // Content Security Policy
    const nonce = new Date().getTime() + "" + new Date().getMilliseconds();
    const csp = this.getCspForResource(sourceUri, nonce);

    this.GIFTParser.updateText(giftDocument.getText());

    const displaySnippet =
      giftDocument.getText().length === 0 ? "block" : "none";
    const displayPreview =
      giftDocument.getText().length === 0 ? "none" : "block";

    const head = `
		<head>
			<meta http-equiv="Content-type" content="text/html" charset=UTF-8">
			${csp}
			<meta id="vscode-gift-preview-data"
				data-settings="${JSON.stringify(initialData).replace(/"/g, "&quot;")}"
				data-strings="${JSON.stringify(previewStrings).replace(/"/g, "&quot;")}"
				data-state="${JSON.stringify(state || {}).replace(/"/g, "&quot;")}">
      <script src="${this.extensionResourcePath(
        "pre.js"
      )}" nonce="${nonce}"></script>
			<script src="${this.extensionResourcePath(
        "index.js"
      )}" nonce="${nonce}"></script>
			${this.getStyles(sourceUri, config)}
			<link rel="stylesheet" class="code-user-style" href="${this.extensionResourcePath(
        "github-markdown-css.css"
      )}" type="text/css" media="screen">
      <link rel="stylesheet" class="code-user-style" href="${this.extensionResourcePath(
        "katex.min.css"
      )}" type="text/css" media="screen">
			<link rel="stylesheet" class="code-user-style" href="${this.extensionResourcePath(
        "styles.css"
      )}" type="text/css" media="screen">
			<base href="${giftDocument.uri
        .with({ scheme: "vscode-resource" })
        .toString(true)}">
		</head>
		`;

    const body = `
			<body class="vscode-body ${
        config.markEditorSelection ? "showEditorSelection" : ""
      }">
				<div data-js="snippet-div" style="display: ${displaySnippet}">
					${createSnippetPreview()}
				</div>
				<div data-js="preview-div" style="display: ${displayPreview}">
					${this.GIFTParser.getHTML()}
				</div>
				<div data-js="button-div" style="display: ${displayPreview}">
					${actionButton}
				</div>
			</body>
		`;

    return {
      head,
      body,
      blankState: giftDocument.getText().length === 0 ? true : false,
    };
  }

  private extensionResourcePath(mediaFile: string): string {
    return Uri.file(this.context.asAbsolutePath(path.join("media", mediaFile)))
      .with({ scheme: "vscode-resource" })
      .toString();
  }

  private fixHref(resource: Uri, href: string): string {
    if (!href) {
      return href;
    }

    // Use href if it is already an URL
    const hrefUri = Uri.parse(href);
    if (["http", "https"].indexOf(hrefUri.scheme) >= 0) {
      return hrefUri.toString();
    }

    // Use href as file URI if it is absolute
    if (path.isAbsolute(href) || hrefUri.scheme === "file") {
      return Uri.file(href).with({ scheme: "vscode-resource" }).toString();
    }

    // Use a workspace relative path if there is a workspace
    const root = workspace.getWorkspaceFolder(resource);
    if (root) {
      return Uri.file(path.join(root.uri.fsPath, href))
        .with({ scheme: "vscode-resource" })
        .toString();
    }

    // Otherwise look relative to the gift file
    return Uri.file(path.join(path.dirname(resource.fsPath), href))
      .with({ scheme: "vscode-resource" })
      .toString();
  }

  private getStyles(resource: Uri, config: GIFTPreviewConfiguration): string {
    if (Array.isArray(config.styles)) {
      return config.styles
        .map((style) => {
          return `<link rel="stylesheet" class="code-user-style" data-source="${style.replace(
            /"/g,
            "&quot;"
          )}" href="${this.fixHref(
            resource,
            style
          )}" type="text/css" media="screen">`;
        })
        .join("\n");
    } else {
      return ``;
    }
  }

  private getCspForResource(resource: Uri, nonce: string): string {
    switch (this.cspArbiter.getSecurityLevelForResource(resource)) {
      case GIFTPreviewSecurityLevel.AllowInsecureContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: http: https: data:; media-src vscode-resource: http: https: data:; script-src https: vscode-resource:; style-src vscode-resource: 'unsafe-inline' http: https: data:; font-src vscode-resource: http: https: data:;">`;

      case GIFTPreviewSecurityLevel.AllowInsecureLocalContent:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https: data: http://localhost:* http://127.0.0.1:*; media-src vscode-resource: https: data: http://localhost:* http://127.0.0.1:*; script-src https: vscode-resource:; style-src vscode-resource: 'unsafe-inline' https: data: http://localhost:* http://127.0.0.1:*; font-src vscode-resource: https: data: http://localhost:* http://127.0.0.1:*;">`;

      case GIFTPreviewSecurityLevel.AllowScriptsAndAllContent:
        return "";

      case GIFTPreviewSecurityLevel.Strict:
      default:
        return `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https: data:; media-src vscode-resource: https: data:; script-src https: vscode-resource:; style-src vscode-resource: 'unsafe-inline' https: data:; font-src vscode-resource: https: data:;">`;
    }
  }
}
