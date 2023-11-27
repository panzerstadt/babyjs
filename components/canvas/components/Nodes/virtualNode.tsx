import { memo } from "react";
import { NodeToolbar, Position, ReactFlowState, useStore } from "reactflow";
import { SimpleHandle } from "../Handles";
import { NODE_TYPE } from "./types";
import { GatewayType } from "../../constants/gateways";
import { PhysicalDeviceType, VirtualDeviceType } from "../../constants/devices";

const zoomSelector = (s: ReactFlowState) => s.transform[2] >= 1.5;

export type MonitorNodeData = (GatewayType | VirtualDeviceType | PhysicalDeviceType) & {
  type: NODE_TYPE;
  enabled?: boolean;
};

/**
 * monitor node:
 * - shows health
 * - shows ip / hostname
 * - shows connection speed
 */
export const VirtualNode = memo<{ data: MonitorNodeData; isConnectable: boolean }>(({ data, isConnectable }) => {
  const nodeType = data.type;
  const showTargetHandle = nodeType === NODE_TYPE.END || nodeType === NODE_TYPE.MIDDLE;
  const showSourceHandle = nodeType === NODE_TYPE.START || nodeType === NODE_TYPE.MIDDLE;

  const zoomedIn = useStore(zoomSelector);
  const isDisabled = data.enabled === false;

  return (
    <div
      className={`
      relative
      transition-all rounded-md border-2 border-dashed
      border-sky-400 bg-gray-50 text-sky-500
      ${zoomedIn ? "py-2 px-3" : "py-2 px-4"}
      ${isDisabled ? "bg-gray-100 text-gray-300" : "text-gray-800"}
      `}
    >
      <NodeToolbar>
        <div className="text-xs flex gap-2">
          <button>on</button>
          <button>off</button>
        </div>
      </NodeToolbar>
      {showTargetHandle && <SimpleHandle type="target" position={Position.Left} isConnectable={isConnectable} />}
      {showSourceHandle && <SimpleHandle type="source" position={Position.Right} isConnectable={isConnectable} />}
      <div className={`transition-colors text-xs ${isDisabled ? "text-gray-300" : "text-sky-500"}`}>
        {!zoomedIn ? data.label : <Detail data={data} />}
      </div>
      {/* <input className="nodrag" type="color" onChange={data.onChange} defaultValue={data.color} /> */}
    </div>
  );
});

VirtualNode.displayName = "VirtualNode";

interface Data {
  data: MonitorNodeData;
  lastChecked?: number;
}
const Detail: React.FC<Data> = ({ data, lastChecked }) => {
  const isDisabled = data.enabled === false;
  return (
    <div className="flex flex-col text-xs text-sky-500">
      <span>
        {data.label} <small className="italic opacity-50">virtual</small>
      </span>

      {!isDisabled && (
        <>
          {lastChecked && (
            <span className="text-[6px] text-gray-500 italic leading-[10px]">
              last checked: {new Date(lastChecked).toLocaleString() || "never checked"}
            </span>
          )}
          <span className="text-[8px] italic text-gray-500 leading-[8px]">{data.ip}</span>
          <a className="underline text-blue-500 text-[9px] leading-[12px]" href={data.url} target="__blank" rel="noreferrer noopener">
            {data.url}
          </a>
        </>
      )}
    </div>
  );
};
