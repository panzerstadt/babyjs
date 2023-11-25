import { RuntimeError } from "./errors";
import { _EMPTY_FN_RETURN, _UNINITIALIZED } from "./token";

export const MAX_PARAMETER_COUNT = 255;

const _checkSentinels = (object: unknown) => {
  if (object === _UNINITIALIZED)
    throw new RuntimeError(
      `Sentinel Value detected as a possible user value. This should not be happening.`
    );

  if (object === _EMPTY_FN_RETURN)
    throw new RuntimeError(
      `You may be assigning a function with no return values to a variable. This is not allowed.`
    );
};

// https://chat.openai.com/share/ba09a5f7-a8a4-4401-aa24-898c91c89d40
export const isTruthy = (object?: Object | null): boolean => {
  _checkSentinels(object);

  if (object === null) return false;
  if (object === undefined) return false;
  if (typeof object === "boolean") return Boolean(object);
  return true;
};

export const canDeclareWithValue = (object: unknown): boolean => {
  if (object === undefined) return false;
  if (object === null) return false;

  if (object === _UNINITIALIZED) return true;
  return true;
};

export const isValueUninitialized = (object: unknown): boolean => {
  return object === _UNINITIALIZED;
};

export const isValidUserValue = (object: unknown): boolean => {
  _checkSentinels(object);

  if (object === undefined) return false;
  if (object === null) return false;

  return true;
};
