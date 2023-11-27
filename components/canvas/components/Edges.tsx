import { Edge } from "reactflow";

export const connect = (from: string, to: string, enabled?: boolean): Edge => {
  return {
    id: `${from}-${to}`,
    source: from,
    target: to,
    animated: enabled !== undefined ? enabled : true,
    style: { stroke: enabled !== undefined ? (enabled ? "#555" : "#ccc") : "#555" },
  };
};
