import { NULL_LITERAL } from "./token";

// https://chat.openai.com/share/ba09a5f7-a8a4-4401-aa24-898c91c89d40
export const isTruthy = (object: Object): boolean => {
  if (object === NULL_LITERAL) return false;
  if (object === null) return false;
  if (object === undefined) return false;
  if (typeof object === "boolean") return Boolean(object);
  return true;
};
