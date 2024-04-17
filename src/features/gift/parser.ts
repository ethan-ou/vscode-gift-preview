import { parser } from "gift-parser-ide";

export default function (text: string): {
  type: "result" | "error";
  result: any;
} {
  try {
    return { type: "result", result: parser.parseRaw(text) };
  } catch (error) {
    return {
      type: "error",
      result: error,
    };
  }
}
