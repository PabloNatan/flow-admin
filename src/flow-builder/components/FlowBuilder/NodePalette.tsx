import React, { useRef, useEffect } from "react";
import { PlusIcon } from "@heroicons/react/24/outline";
import { NodeType } from "@/flow-builder/types/flow.types";
import { nodeTypes } from "@/flow-builder/types/nodeType.types";

interface NodePaletteProps {
  onAddNode: (type: NodeType, position?: { x: number; y: number }) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({
  onAddNode,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: NodeType
  ) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleNodeClick = (nodeType: NodeType) => {
    onAddNode(nodeType);
    onClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-[80vh] flex flex-col mr-28 mt-12"
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Node Palette</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title="Close palette"
          >
            <PlusIcon className="w-4 h-4 rotate-45" />
          </button>
        </div>

        <div className="p-4 space-y-2 overflow-y-auto flex-1">
          {nodeTypes.map((nodeType) => {
            const IconComponent = nodeType.icon;
            return (
              <div
                key={nodeType.type}
                draggable
                onDragStart={(event) => handleDragStart(event, nodeType.type)}
                onClick={() => handleNodeClick(nodeType.type)}
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
      </div>
    </div>
  );
};

export default NodePalette;
