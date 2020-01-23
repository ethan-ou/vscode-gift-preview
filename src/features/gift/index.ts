import giftPreviewHTML from "./giftHTML";
import parser from "./parser";

export default function(text: string): string {
    const validation = parser.parse(text);
    return validation.type === "result" ? giftPreviewHTML(validation.result) : ``;
}