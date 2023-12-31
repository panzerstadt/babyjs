import { memo } from "react";
import { getHealthColor, useHealthCheck } from "../useHealthCheck";
import { Position } from "reactflow";
import { nodeColor } from "./utils";
import { SimpleHandle } from "../Handles";
import { NODE_TYPE } from "./types";

export interface SimpleNodeData {
  type: NODE_TYPE;
  label: string;
  enabled?: boolean;
}

/**
 * simple node:
 * - shows label
 */
export const SimpleNode = memo<{ data: any; isConnectable: boolean }>(({ data, isConnectable }) => {
  const nodeType = data.type;
  const showTargetHandle = nodeType === NODE_TYPE.END || nodeType === NODE_TYPE.MIDDLE;
  const showSourceHandle = nodeType === NODE_TYPE.START || nodeType === NODE_TYPE.MIDDLE;

  const [health] = useHealthCheck();

  return (
    <div className="py-2 px-4 m-1 rounded-md border-2 bg-white" style={{ borderColor: nodeColor(data) }}>
      {showTargetHandle && <SimpleHandle type="target" position={Position.Left} isConnectable={isConnectable} />}
      {showSourceHandle && <SimpleHandle type="source" position={Position.Right} isConnectable={isConnectable} />}
      <div className="text-xs text-gray-800" style={{ color: getHealthColor(health).text }}>
        {data.label}
      </div>
      {/* <input className="nodrag" type="color" onChange={data.onChange} defaultValue={data.color} /> */}
    </div>
  );
});

SimpleNode.displayName = "MonitorNode";
