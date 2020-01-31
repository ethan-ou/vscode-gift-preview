import diff from "deep-diff";
import eol from 'eol';
import giftRegex from "./giftRegex";
import giftHTML from "./giftHTML";
import parser from "./parser";

// TODO: Fix undefined for one of the questions in giftHTML!

export default class GIFTParser {
  public text: string;
  public html: string;
  private blankLines: any[];
  private finalText: any[];
  private lineNumbers: number[];

  constructor(text = '') {
    const cleanText = eol.lf(text);
    this.text = cleanText;
    this.lineNumbers = this.generateLineNumbers(cleanText);
   
    this.blankLines = this.findBlankLines(cleanText);
    this.finalText = this.parseLines(this.blankLines);
   
    this.html = this.finalText.join('\n\n');
  }

  public updateText(text: string) {
    const cleanText = eol.lf(text);
    this.text = cleanText;
    this.lineNumbers = this.generateLineNumbers(cleanText);

    const newBlankLines = this.findBlankLines(cleanText);
    this.finalText = this.diffLines(this.blankLines, newBlankLines, this.finalText);
    
    this.blankLines = newBlankLines;
    this.html = this.finalText.join('\n\n');
  }

  private findBlankLines(text: string) {
    return text.split("\n\n");
  }

  private parseLines(splitLines: any) {
    let finalText = [];
    for (let i=0; i < splitLines.length; i++) {
      finalText = this.generateHTML(splitLines[i], i, finalText, this.lineNumbers[i]);
    }
    return finalText;
  }

  private diffLines(oldLines: any, newLines: any, finalText: any) {
    const diffArray = diff(oldLines, newLines);
    if (!diffArray) {
      return finalText;
    }

    let finalTextCopy = finalText;

    for (let i=0; i<diffArray.length; i++) {
      let diff = diffArray[i];

      let diffKind = (diff && diff.kind && diff.kind[0]) || (diff && diff.kind);
      
      // If the change was an Edit
      if (diffKind === "E") {
        finalTextCopy = this.generateHTML(diff.rhs, diff.path[0], finalTextCopy, this.lineNumbers[diff.path[0]]);
      }

      // If the change was an Array change
      if (diffKind === "A") {
        if (diff.item.kind === "N") {
          finalTextCopy = this.generateHTML(diff.item.rhs, diff.index, finalTextCopy, this.lineNumbers[diff.index]);
        }
        if (diff.item.kind === "D") {
          finalTextCopy.splice(diff.index, 1);
        }
        
      }
    }

    return finalTextCopy;
  }

   private generateHTML(text: string, index: number, array: any[], line?: number) {
    let parsedLine = parser.parse(text);
    
    if (parsedLine.type === "result") {
      array[index] = `<div class="code-line" data-line="${line}">${giftHTML(parsedLine.result)}</div>`;
    }
    if (parsedLine.type === "error") {
      array[index] = `<div class="code-line" data-line="${line}">${giftRegex(text)}</div>`;
    }

    return array;
   }

   private generateLineNumbers(text: string) {
    const lineNumbers: any[] = [];
    const prev: any[] = [];
    
    const lines = text.split("\n\n").map(line => {
      prev.push(line.split("\n").length);
      return line.split("\n").length;
    });

    let memory = 0;
    for (let i = 0; i < lines.length; i++) {
      memory += lines[i] + 1;
      lineNumbers.push(memory - prev[i]);
    }

     return lineNumbers.map(line => line - 1);
   }
}