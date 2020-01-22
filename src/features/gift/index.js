import giftPreviewHTML from "./giftHTML";
import parser from "./parser";

export default function(text) {
    const validation = parser.parse(text);
    let result;
    if (validation.type === "result") result = validation.result;
    let output = "";
    return giftPreviewHTML(result, output);
}