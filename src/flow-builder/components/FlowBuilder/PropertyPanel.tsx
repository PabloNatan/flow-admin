import React, { useState } from "react";
import { CogIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { Node } from "reactflow";
import { FlowVariable, NodeType } from "@/flow-builder/types/flow.types";
import { nodeTypes } from "@/flow-builder/types/nodeType.types";
import TriggerForm from "../Forms/TriggerForm";
import MessageForm from "../Forms/MessageForm";
import { InputForm } from "../Forms/InputForm";
import { ConditionForm } from "../Forms/ConditionForm";
import VariableHelper from "../Common/VariableHelper";
import DelayForm from "../Forms/DelayForm";
import ActionForm from "../Forms/ActionForm";
import EndForm from "../Forms/EndForm";
import { TextInput } from "../core";

interface PropertyPanelProps {
  selectedNode: Node | null;
  onUpdateNode: (nodeId: string, newData: any) => void;
  variables: FlowVariable[];
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const PropertyPanel: React.FC<PropertyPanelProps> = ({
  selectedNode,
  onUpdateNode,
  variables,
  isCollapsed,
  setIsCollapsed,
}) => {
  const [activeTab, setActiveTab] = useState<"config" | "variables">("config");

  if (!selectedNode) {
    return (
      <div
        className={`bg-white border-l border-gray-200 transition-all duration-300 ${
          isCollapsed ? "w-12" : "w-80"
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {!isCollapsed && (
            <h3 className="font-semibold text-gray-800">Properties</h3>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isCollapsed ? "Expand properties" : "Collapse properties"}
          >
            <CogIcon className="w-4 h-4" />
          </button>
        </div>
        {!isCollapsed && (
          <div className="p-4 text-center text-gray-500">
            <div className="mb-2">
              <ChatBubbleLeftRightIcon className="w-12 h-12 mx-auto text-gray-300" />
            </div>
            <p className="text-sm">
              Select a node to view and edit its properties
            </p>
          </div>
        )}
      </div>
    );
  }

  const nodeConfig = nodeTypes.find((nt) => nt.type === selectedNode.data.type);
  const IconComponent = nodeConfig?.icon || ChatBubbleLeftRightIcon;

  const updateConfig = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      config: {
        ...selectedNode.data.config,
        [field]: value,
      },
    });
  };

  const updateNodeData = (newData: any) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      ...newData,
    });
  };

  return (
    <div
      className={`bg-white border-l border-gray-200 transition-all duration-300 ${
        isCollapsed ? "w-12" : "w-80"
      }`}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <IconComponent
              className="w-5 h-5"
              style={{ color: nodeConfig?.color }}
            />
            <h3 className="font-semibold text-gray-800">{nodeConfig?.label}</h3>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title={isCollapsed ? "Expand properties" : "Collapse properties"}
        >
          <CogIcon className="w-4 h-4" />
        </button>
      </div>

      {!isCollapsed && (
        <div className="h-full overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("config")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "config"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Config
            </button>
            <button
              onClick={() => setActiveTab("variables")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === "variables"
                  ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Variables
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 mb-10 pb-10">
            {activeTab === "config" && (
              <>
                <TextInput
                  label="Node Name"
                  placeholder="Enter node name"
                  onChange={(value) => updateConfig("name", value)}
                  value={selectedNode.data.config?.name || ""}
                />

                {/* Type-specific configuration */}
                {selectedNode.data.type === NodeType.TRIGGER && (
                  <TriggerForm
                    selectedNode={selectedNode}
                    updateConfig={updateConfig}
                  />
                )}
                {selectedNode.data.type === NodeType.MESSAGE && (
                  <MessageForm
                    selectedNode={selectedNode}
                    updateConfig={updateConfig}
                  />
                )}
                {selectedNode.data.type === NodeType.INPUT && (
                  <InputForm
                    selectedNode={selectedNode}
                    updateConfig={updateConfig}
                  />
                )}
                {selectedNode.data.type === NodeType.CONDITION && (
                  <ConditionForm
                    selectedNode={selectedNode}
                    updateConfig={updateConfig}
                    variables={variables}
                  />
                )}
                {selectedNode.data.type === NodeType.DELAY && (
                  <DelayForm
                    selectedNode={selectedNode}
                    updateConfig={updateConfig}
                  />
                )}
                {selectedNode.data.type === NodeType.ACTION && (
                  <ActionForm
                    selectedNode={selectedNode}
                    updateConfig={updateConfig}
                  />
                )}
                {selectedNode.data.type === NodeType.END && (
                  <EndForm
                    selectedNode={selectedNode}
                    updateConfig={updateConfig}
                  />
                )}
              </>
            )}

            {activeTab === "variables" && (
              <VariableHelper variables={variables} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyPanel;
