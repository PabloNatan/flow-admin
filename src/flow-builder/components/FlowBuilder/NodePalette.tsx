import React from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { NodeType } from "@/flow-builder/types/flow.types";
import { nodeTypes } from "@/flow-builder/types/nodeType.types";

interface NodePaletteProps {
  onAddNode: (type: NodeType, position?: { x: number; y: number }) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({
  onAddNode,
  isCollapsed,
  setIsCollapsed,
}) => {
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      className={`bg-white border-r border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-64"
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <h3 className="font-semibold text-gray-800">Node Palette</h3>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isCollapsed ? "Expand palette" : "Collapse palette"}
        >
          <PlusIcon
            className={`w-4 h-4 transition-transform ${
              isCollapsed ? "rotate-45" : ""
            }`}
          />
        </button>
      </div>

      {!isCollapsed && (
        <div className="p-4 space-y-2 h-full overflow-y-auto">
          {nodeTypes.map((nodeType) => {
            const IconComponent = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                draggable
                onDragStart={(event) => handleDragStart(event, nodeType.type)}
                onClick={() => onAddNode(nodeType.type)}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm transition-all duration-200"
                style={{
                  borderLeft: `4px solid ${nodeType.color}`,
                }}
              >
                <IconComponent
                  className="w-5 h-5 flex-shrink-0"
                  style={{ color: nodeType.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-sm text-gray-800 truncate">
                    {nodeType.label}
                  </div>
                  <div className="text-xs text-gray-600 truncate">
                    {nodeType.description}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="pt-4 mt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <p>
                💡 <strong>Tip:</strong> Drag nodes to canvas or click to add
              </p>
              <p>🔗 Connect nodes by dragging from output to input</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NodePalette;
