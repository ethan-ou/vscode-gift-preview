import { parse } from "./giftParser";

export default function (
  text: string
): { type: "result" | "error"; result: any } {
  try {
    return { type: "result", result: parse(text) };
  } catch (error) {
    return {
      type: "error",
      result: error,
    };
  }
}
