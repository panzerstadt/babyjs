import { memo } from "react";
import { Position } from "reactflow";
import { SimpleHandle } from "../Handles";
import { NODE_TYPE } from "./types";
import { Editor } from "@/components/interpreter/interface";

export interface SimpleNodeData {
  type: NODE_TYPE;
  label: string;
  enabled?: boolean;
}

/**
 * simple node:
 * - shows label
 */
export const DagDogNode = memo<{ data: any; isConnectable: boolean }>(({ data, isConnectable }) => {
  const nodeType = data.type;
  const showTargetHandle = nodeType === NODE_TYPE.END || nodeType === NODE_TYPE.MIDDLE;
  const showSourceHandle = nodeType === NODE_TYPE.START || nodeType === NODE_TYPE.MIDDLE;

  const nodeInput = { value: 15 }; // TODO: this would come from the previous function, under data.input

  return (
    <div style={{ height: 400, width: 600 }}>
      {showTargetHandle && (
        <SimpleHandle type="target" position={Position.Left} isConnectable={isConnectable} />
      )}
      {showSourceHandle && (
        <SimpleHandle type="source" position={Position.Right} isConnectable={isConnectable} />
      )}
      <div className="text-xs text-gray-800">{data.label}</div>
      {/* <Repl lang="dagdog" /> */}
      <Editor lang="dagdog" input={nodeInput} />
      {/* <input className="nodrag" type="color" onChange={data.onChange} defaultValue={data.color} /> */}
    </div>
  );
});

DagDogNode.displayName = "DagDogNode";
