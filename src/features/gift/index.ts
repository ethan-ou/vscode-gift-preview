import giftHTML from "./giftHTML";
import giftRegex from "./giftRegex";
import parser from "./parser";

export default function(text: string): string {
    const validation = parser.parse(text);
    return validation.type === "result" ? giftHTML(validation.result) : giftRegex(text);
}