/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// import { getElementsForSourceLine } from './scroll-sync';

export class ActiveLineMarker {
  private _current: HTMLElement | undefined;

  onDidChangeTextEditorSelection(line: number): void {
    // Uncomment if active line class is needed
    // const { previous } = getElementsForSourceLine(line);
    // this._update(previous && previous.element);
  }

  _update(before: HTMLElement | undefined): void {
    this._unmarkActiveElement(this._current);
    this._markActiveElement(before);
    this._current = before;
  }

  _unmarkActiveElement(element: HTMLElement | undefined): void {
    if (!element) {
      return;
    }
    element.className = element.className.replace(/\bcode-active-line\b/g, "");
  }

  _markActiveElement(element: HTMLElement | undefined): void {
    if (!element) {
      return;
    }
    element.className += " code-active-line";
  }
}
