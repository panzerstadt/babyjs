import { Node } from "reactflow";
import { NODE_TYPE } from "./types";

export const nodeColor = (nodeData: Node["data"], enabled?: boolean) => {
  if (enabled === false) return "#BAC1CC";
  switch (nodeData.type) {
    case NODE_TYPE.START:
      return "#276fbf";
    case NODE_TYPE.MIDDLE:
      return "#4C3B4D";
    case NODE_TYPE.END:
      return "#61C9A8";
    default:
      return "#ADA8B6";
  }
};

export const posX = (column = 0, padding = 30) => {
  return padding + column * 300;
};
export const posY = (column = 0, padding = 30) => {
  return padding + column * 75;
};
