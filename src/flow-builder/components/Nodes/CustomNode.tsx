import { BaseConditionConfig, NodeType } from "@/flow-builder/types/flow.types";
import { nodeTypes } from "@/flow-builder/types/nodeType.types";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import React from "react";
import { Handle, NodeProps, Position } from "reactflow";

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
      className={classNames(
        "flex flex-col",
        "shadow-lg rounded-lg",
        "bg-white border-2 min-w-[180px]",
        selected ? "border-blue-500" : "border-gray-200"
      )}
      style={{ borderLeftColor: nodeConfig?.color, borderLeftWidth: "4px" }}
    >
      {/* Input Handle */}
      {data.type !== NodeType.TRIGGER && (
        <Handle
          type="target"
          position={Position.Left}
          className="!bg-gray-400 border-2 border-white"
          style={{
            top: 5,
            left: -2,
            right: 'auto',
            width: '10px',
            height: '10px',
            transform: 'none',
          }}
        />
      )}

      <div className="flex-1 flex flex-col p-4">

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
            position={Position.Right}
            className="!bg-blue-500 border-2 border-white"
            style={{
              bottom: 10,
              right: 5,
              width: '10px',
              height: '10px',
              top: 'auto',
              left: 'auto',
              transform: 'none',
            }}
          />
        )}

        {/* Multiple output handles for condition nodes */}
        {data.type === NodeType.CONDITION && (
          <>
            {/* Handles for individual conditions */}
            {(data.config as BaseConditionConfig)?.conditions?.map(
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
            {/* Handle for default condition */}
            {(data.config as BaseConditionConfig)?.defaultCondition && (
              <Handle
                key="default"
                type="source"
                position={Position.Right}
                id={(data.config as BaseConditionConfig).defaultCondition.id}
                style={{
                  top: `${30 + ((data.config as BaseConditionConfig)?.conditions?.length || 0) * 20}px`,
                  background: "#6b7280", // Gray color for default condition
                }}
                className="w-3 h-3 border-2 border-white"
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CustomNode;
