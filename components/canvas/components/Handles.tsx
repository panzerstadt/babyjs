import { Handle, Position } from "reactflow";

export interface SimpleHandleProps {
  isConnectable: boolean;
  position: Position;
  type: "source" | "target";
}
export const SimpleHandle: React.FC<SimpleHandleProps> = ({ isConnectable, position, type }) => {
  return (
    <Handle
      type={type}
      position={position}
      style={{ background: "#555" }}
      onConnect={(params) => console.log("handle onConnect", params)}
      isConnectable={isConnectable}
    />
  );
};
