import { useEffect, useState } from "react";

// FIXME: switch to the fresh new DoublyLinkedList
export const useHistory = () => {
  const [viewIdx, setViewIdx] = useState<number | null>(null);
  const [view, setView] = useState<any>();
  const [log, _setLog] = useState<any[]>([]);
  const handleAppendLog = (value: any) => {
    setViewIdx(null);
    _setLog((p) => [...p, value]);
  };
  const handleAppendLogMulti = (values: any[]) => {
    setViewIdx(null);
    _setLog((p) => [...p, ...values]);
  };

  const back = () => {
    if (log.length === 0) return;
    const newIdx = viewIdx === null ? 0 : viewIdx + 1;

    if (!log[newIdx]) return; // if the new idx is out of bounds, don't update
    setViewIdx(newIdx);
  };

  const forward = () => {
    if (log.length === 0) return;
    if (viewIdx === null) return;
    const newIdx = viewIdx - 1;
    if (!log[newIdx]) {
      setViewIdx(null);
      return;
    }
    setViewIdx(newIdx);
  };

  useEffect(() => {
    if (viewIdx === null) {
      setView(null);
    } else {
      const tmp = [...log];
      tmp.reverse();
      setView(tmp[viewIdx]);
    }
  }, [viewIdx, log]);

  // console.log(`current change: ${viewIdx}, ${view}, log: [${log}]`);

  return [view, { back, forward, add: handleAppendLog, addBatch: handleAppendLogMulti }] as const;
};
