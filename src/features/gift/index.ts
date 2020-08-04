import diff from "deep-diff";
import eol from "eol";
import giftRegex from "./giftRegex";
import giftHTML from "./giftHTML";
import parser from "./parser";

interface ParseResult {
  type: string;
  result: any;
}

export default class GIFTParser {
  public text: string;
  public html: string;
  private lineNumbers: number[];
  private blankLines: string[];
  private finalText: string[];

  constructor(text = "") {
    const cleanText: string = eol.lf(text);
    this.text = cleanText;
    this.lineNumbers = this.generateLineNumbers(cleanText);

    this.blankLines = this.findBlankLines(cleanText);
    this.finalText = this.parseLines(this.blankLines);

    this.html = this.generateCodeLines(this.finalText, this.lineNumbers).join(
      "\n\n"
    );
  }

  public updateText(text: string): void {
    const cleanText: string = eol.lf(text);
    this.text = cleanText;
    this.lineNumbers = this.generateLineNumbers(cleanText);

    const newBlankLines = this.findBlankLines(cleanText);
    this.finalText = this.diffLines(
      this.blankLines,
      newBlankLines,
      this.finalText
    );

    this.blankLines = newBlankLines;
    this.html = this.generateCodeLines(this.finalText, this.lineNumbers).join(
      "\n\n"
    );
  }

  public getHTML() {
    return this.html;
  }

  private findBlankLines(text: string): string[] {
    return text.split("\n\n");
  }

  private parseLines(splitLines: any): string[] {
    let finalText: string[] = [];
    for (let i = 0; i < splitLines.length; i++) {
      finalText = this.generateHTML(splitLines[i], i, finalText);
    }
    return finalText;
  }

  private diffLines(
    oldLines: string[],
    newLines: string[],
    finalText: string[]
  ): string[] {
    const diffArray: any[] = diff(oldLines, newLines);
    if (!diffArray) {
      return finalText;
    }

    // console.log(diffArray);
    let finalTextCopy: string[] = Array.from(finalText);

    for (let i = 0; i < diffArray.length; i++) {
      let diff = diffArray[i];
      let diffKind = (diff && diff.kind && diff.kind[0]) || (diff && diff.kind);

      // If the change was an Edit
      if (diffKind === "E") {
        finalTextCopy = this.generateHTML(
          diff.rhs,
          diff.path[0],
          finalTextCopy
        );
      }

      // If the change was an Array change
      if (diffKind === "A") {
        if (diff.item.kind === "N") {
          finalTextCopy = this.generateHTML(
            diff.item.rhs,
            diff.index,
            finalTextCopy
          );
        }
        if (diff.item.kind === "D") {
          finalTextCopy.splice(diff.index, 1);
        }
      }
    }

    return finalTextCopy;
  }

  private generateHTML(text: string, index: number, array: string[]): string[] {
    let parsedLine: ParseResult = parser(text);
    const tempArray: string[] = Array.from(array);

    if (parsedLine.type === "result") {
      tempArray[index] = giftHTML(parsedLine.result);
    }
    if (parsedLine.type === "error") {
      tempArray[index] = giftRegex(text);
    }

    return tempArray;
  }

  private generateLineNumbers(text: string): number[] {
    const lineNumbers: number[] = [];
    const lines = text.split("\n\n").map((line) => line.split("\n").length);

    let memory = -1;
    for (let line of lines) {
      memory += line + 1;
      lineNumbers.push(memory - line);
    }

    return lineNumbers;
  }

  private generateCodeLines(array: string[], lines: number[]): string[] {
    return array.map(
      (item, index) =>
        `<div class="code-line" data-line="${lines[index]}">${item}</div>`
    );
  }
}
