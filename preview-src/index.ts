/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { ActiveLineMarker } from "./activeLineMarker";
import { onceDocumentLoaded } from "./events";
import { createPosterForVsCode } from "./messaging";
import {
  getEditorLineNumberForPageOffset,
  scrollToRevealSourceLine,
} from "./scroll-sync";
import { getSettings, getData } from "./settings";
import { updateHTML, displaySnippets } from "./update";
import throttle = require("lodash.throttle");

declare const acquireVsCodeApi: any;

let scrollDisabled = true;
const marker = new ActiveLineMarker();
const settings = getSettings();

const vscode = acquireVsCodeApi();

// Set VS Code state
const state = getData("data-state");
vscode.setState(state);

let snippets = false;
let prevHTML: string;
let prevLine: { line: number; settings: any };
let prevSnippetScroll = 0;

const messaging = createPosterForVsCode(vscode);

window.cspAlerter.setPoster(messaging);

onceDocumentLoaded(() => {
  if (settings.scrollPreviewWithEditor) {
    setTimeout(() => {
      const initialLine = +settings.line;
      if (!isNaN(initialLine)) {
        scrollDisabled = true;
        scrollToRevealSourceLine(initialLine);
      }
    }, 0);
  }
});

const onUpdateView = (() => {
  const doScroll = throttle((line: number) => {
    scrollDisabled = true;
    scrollToRevealSourceLine(line);
  }, 40);

  return (line: number, settings: any) => {
    if (!isNaN(line)) {
      settings.line = line;
      doScroll(line);
    }
  };
})();

window.addEventListener(
  "resize",
  () => {
    scrollDisabled = true;
  },
  true
);

window.addEventListener(
  "message",
  (event) => {
    if (event.data.source !== settings.source) {
      return;
    }

    switch (event.data.type) {
      case "onDidChangeTextEditorSelection":
        marker.onDidChangeTextEditorSelection(event.data.line);
        break;

      case "updateView":
        onUpdateView(event.data.line, settings);
        prevLine = { line: event.data.line, settings };
        break;

      case "updateHTML":
        updateHTML(event.data.html, {
          initial: event.data.state,
          snippets: snippets,
        });
        prevHTML = event.data.html;

        if (!snippets && prevLine) {
          onUpdateView(prevLine.line, prevLine.settings);
        }

        break;
    }
  },
  false
);

document.addEventListener("dblclick", (event) => {
  if (!settings.doubleClickToSwitchToEditor) {
    return;
  }

  // Ignore clicks on links
  for (
    let node = event.target as HTMLElement;
    node;
    node = node.parentNode as HTMLElement
  ) {
    if (node.tagName === "A") {
      return;
    }
  }

  const offset = event.pageY;
  const line = getEditorLineNumberForPageOffset(offset);
  if (typeof line === "number" && !isNaN(line)) {
    messaging.postMessage("didClick", { line: Math.floor(line) });
  }
});

document.addEventListener(
  "click",
  (event) => {
    if (!event) {
      return;
    }

    let node: any = event.target;
    while (node) {
      if (node.tagName && node.tagName === "A" && node.href) {
        if (node.getAttribute("href").startsWith("#")) {
          break;
        }
        if (
          node.href.startsWith("file://") ||
          node.href.startsWith("vscode-resource:")
        ) {
          const [path, fragment] = node.href
            .replace(/^(file:\/\/|vscode-resource:)/i, "")
            .split("#");
          messaging.postCommand("_gift.openDocumentLink", [{ path, fragment }]);
          event.preventDefault();
          event.stopPropagation();
          break;
        }
        break;
      }

      if (node) {
        if (node.getAttribute("data-js") === "action-button") {
          snippets = !snippets;

          if (prevHTML) {
            updateHTML(prevHTML, {
              snippets: snippets,
            });
          } else {
            displaySnippets(document, snippets);
          }

          if (!snippets && prevLine) {
            prevSnippetScroll = Math.floor(window.scrollY);
            onUpdateView(prevLine.line, prevLine.settings);
          }

          // Scroll to the top of the snippets page, or to where
          // the user last scrolled.
          if (snippets) {
            window.scrollTo(0, prevSnippetScroll);
          }

          break;
        }
        break;
      }

      node = node.parentNode;
    }
  },
  true
);

if (settings.scrollEditorWithPreview) {
  window.addEventListener(
    "scroll",
    throttle(() => {
      if (scrollDisabled) {
        scrollDisabled = false;
      } else {
        const line = getEditorLineNumberForPageOffset(window.scrollY);
        if (typeof line === "number" && !isNaN(line)) {
          messaging.postMessage("revealLine", { line });
        }
      }
    }, 40)
  );
}
