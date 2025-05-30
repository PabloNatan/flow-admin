import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { BaseConditionConfig, NodeType } from "@/flow-builder/types/flow.types";
import { nodeTypes } from "@/flow-builder/types/nodeType.types";

interface CustomNodeData {
  type: NodeType;
  config: any;
}

const CustomNode: React.FC<NodeProps<CustomNodeData>> = ({
  data,
  selected,
}) => {
  const nodeConfig = nodeTypes.find((nt) => nt.type === data.type);
  const IconComponent = nodeConfig?.icon || ChatBubbleLeftRightIcon;

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-white border-2 min-w-[180px] ${
        selected ? "border-blue-500" : "border-gray-200"
      }`}
      style={{ borderLeftColor: nodeConfig?.color, borderLeftWidth: "4px" }}
    >
      {/* Input Handle */}
      {data.type !== NodeType.TRIGGER && (
        <Handle
          type="target"
          position={Position.Top}
          className="w-3 h-3 !bg-gray-400 border-2 border-white"
        />
      )}

      <div className="flex items-center gap-2 mb-2">
        <IconComponent
          className="w-5 h-5"
          style={{ color: nodeConfig?.color }}
        />
        <div className="font-semibold text-sm text-gray-800">
          {data.config?.name || nodeConfig?.label}
        </div>
      </div>

      <div className="text-xs text-gray-600">
        {data.type === NodeType.MESSAGE && data.config?.messageType && (
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
            {data.config.messageType}
          </span>
        )}
        {data.type === NodeType.INPUT && data.config?.responseType && (
          <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">
            {data.config.responseType}
          </span>
        )}
        {data.type === NodeType.DELAY && data.config?.delayMs && (
          <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">
            {data.config.delayMs}ms
          </span>
        )}
        {data.type === NodeType.CONDITION &&
          data.config?.conditions?.length && (
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
              {data.config.conditions.length} conditions
            </span>
          )}
      </div>

      {/* Output Handle */}
      {data.type !== NodeType.END && (
        <Handle
          type="source"
          position={Position.Bottom}
          className="w-3 h-3 !bg-blue-500 border-2 border-white"
        />
      )}

      {/* Multiple output handles for condition nodes */}
      {data.type === NodeType.CONDITION &&
        (data.config as BaseConditionConfig)?.conditions?.map(
          (condition, index) => (
            <Handle
              key={condition.id}
              type="source"
              position={Position.Right}
              id={condition.id}
              style={{
                top: `${30 + index * 20}px`,
                background: nodeConfig?.color,
              }}
              className="w-3 h-3 border-2 border-white"
            />
          )
        )}
    </div>
  );
};

export default CustomNode;
