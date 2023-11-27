import { memo } from "react";
import { getHealthColor, useHealthCheck } from "../useHealthCheck";
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
export const MonitorNode = memo<{ data: MonitorNodeData; isConnectable: boolean }>(({ data, isConnectable }) => {
  const nodeType = data.type;
  const showTargetHandle = nodeType === NODE_TYPE.END || nodeType === NODE_TYPE.MIDDLE;
  const showSourceHandle = nodeType === NODE_TYPE.START || nodeType === NODE_TYPE.MIDDLE;

  const [health, checking, lastChecked] = useHealthCheck(data.ip);
  const zoomedIn = useStore(zoomSelector);
  const isDisabled = data.enabled === false;

  return (
    <div
      className={`
      relative
      transition-all rounded-md border-2 bg-white
      ${zoomedIn ? "py-2 px-3" : "py-2 px-4"}
      ${isDisabled ? "bg-gray-100 text-gray-300" : "text-gray-800"}
      `}
      style={{ borderColor: getHealthColor(health).text, backgroundColor: getHealthColor(health).background }}
    >
      {!isDisabled && (
        <>
          <div
            className={`absolute top-0 right-0 rounded-full h-2 w-2 -mt-1 -mr-1  ${checking ? "animate-ping" : ""}`}
            style={{ backgroundColor: getHealthColor(health).text }}
          >
            {" "}
          </div>
          <div className={`absolute top-0 right-0 rounded-full h-2 w-2 -mt-1 -mr-1`} style={{ backgroundColor: getHealthColor(health).text }}>
            {" "}
          </div>
        </>
      )}
      <NodeToolbar>
        <div className="text-xs flex gap-2">
          <button>on</button>
          <button>off</button>
        </div>
      </NodeToolbar>
      {showTargetHandle && <SimpleHandle type="target" position={Position.Left} isConnectable={isConnectable} />}
      {showSourceHandle && <SimpleHandle type="source" position={Position.Right} isConnectable={isConnectable} />}
      <div
        className={`transition-colors text-xs ${isDisabled ? "text-gray-300" : "text-gray-800"}`}
        style={{ color: isDisabled ? undefined : getHealthColor(health).text }}
      >
        {!zoomedIn ? data.label : <Detail data={data} lastChecked={lastChecked} />}
      </div>
      {/* <input className="nodrag" type="color" onChange={data.onChange} defaultValue={data.color} /> */}
    </div>
  );
});

MonitorNode.displayName = "MonitorNode";

interface Data {
  data: MonitorNodeData;
  lastChecked?: number;
}
const Detail: React.FC<Data> = ({ data, lastChecked }) => {
  const isDisabled = data.enabled === false;
  return (
    <div className="flex flex-col text-xs">
      <span>{data.label}</span>

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
