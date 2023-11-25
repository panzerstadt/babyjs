import { Dispatch, MutableRefObject, SetStateAction, useEffect } from "react";
import { Program } from "./program";
import { Line } from "./interface";
import { useQueue } from "../queue/useQueue";

const TERMINAL_SPEED_MS = 50;

const removeTimestamp = (str: string) => {
  const length = Date.now().toString().length + ":".length;
  return str.slice(length);
};

/**
 * TODO: turn this into 3 sub-terminals
 */
const removePhase = (str: string) => {
  if (str.startsWith("scan:")) return str.slice(5);
  if (str.startsWith("parse:")) return str.slice(6);
  if (str.startsWith("interpret:")) return str.slice(10);
  return str;
};

export const useStd = (
  ref: MutableRefObject<Program | undefined>,
  stdType: "out" | "err" | "info" | "debug",
  setLines: Dispatch<SetStateAction<Line[]>>,
  onLineOut?: () => void,
  immediate?: boolean
) => {
  const queue = useQueue<Line>();
  const currentRef = ref.current?.[`std${stdType}`];
  useEffect(() => {
    if (!currentRef) return;
    const std = currentRef
      .split("\n")
      .map((s) => ({ type: stdType, value: removePhase(removeTimestamp(s)) || " " }));

    if (std) {
      queue?.enqueue_batch(std);
    }
  }, [currentRef, stdType, setLines, queue]);

  useEffect(() => {
    if (!queue) return;

    let interval: ReturnType<typeof setInterval>;
    // queue size changed, check for stuff in queue
    if (queue.size > 0) {
      interval = setInterval(
        () => {
          const item = queue.deque();

          if (!item) {
            return clearInterval(interval);
          }

          setLines((p) => [...p, item!]);
          onLineOut?.();
        },
        immediate ? 0 : TERMINAL_SPEED_MS
      );
    }

    return () => {
      clearInterval(interval);
    };
  }, [queue?.size, currentRef]);
};
