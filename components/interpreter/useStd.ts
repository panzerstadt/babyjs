import { Dispatch, MutableRefObject, SetStateAction, useEffect } from "react";
import { Program } from "./program";
import { Line } from "./interface";

const removeTimestamp = (str: string) => {
  const length = Date.now().toString().length + ":".length;
  return str.slice(length);
};

export const useStd = (
  ref: MutableRefObject<Program | undefined>,
  stdType: "out" | "err" | "info",
  setLines: Dispatch<SetStateAction<Line[]>>
) => {
  const currentRef = ref.current?.[`std${stdType}`];
  useEffect(() => {
    if (!currentRef) return;
    const std = currentRef
      .split("\n")
      .map((s) => ({ type: stdType, value: removeTimestamp(s) || " " }));
    std && setLines((p) => [...p, ...std]);
  }, [currentRef, stdType, setLines]);
};
