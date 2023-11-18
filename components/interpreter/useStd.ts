import { Dispatch, MutableRefObject, SetStateAction, useEffect } from "react";
import { Program } from "./program";
import { Line } from "./interface";
import { useQueue } from "../queue/useQueue";

const TERMINAL_SPEED_MS = 50;

const removeTimestamp = (str: string) => {
  const length = Date.now().toString().length + ":".length;
  return str.slice(length);
};

export const useStd = (
  ref: MutableRefObject<Program | undefined>,
  stdType: "out" | "err" | "info",
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
      .map((s) => ({ type: stdType, value: removeTimestamp(s) || " " }));

    if (std) {
      // 1. dump them all into a queue.
      queue?.enqueue_batch(std);
    }

    // std && setLines((p) => [...p, ...std]);
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
