import { RuntimeError } from "./errors";
import { _UNINITIALIZED } from "./token";

const _checkInitialized = (object: unknown) => {
  if (object === _UNINITIALIZED)
    throw new RuntimeError(
      `Sentinel Value detected as a possible user value. This should not be happening.`
    );
};

// https://chat.openai.com/share/ba09a5f7-a8a4-4401-aa24-898c91c89d40
export const isTruthy = (object?: Object | null): boolean => {
  _checkInitialized(object);

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
  _checkInitialized(object);

  if (object === undefined) return false;
  if (object === null) return false;

  return true;
};
