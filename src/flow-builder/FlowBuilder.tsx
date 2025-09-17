"use client";

import React, { useEffect } from "react";
import ReactFlow, {
  Controls,
  MiniMap,
  Background,
  MarkerType,
  ConnectionMode,
} from "reactflow";
import { PlusIcon } from "@heroicons/react/24/outline";

import {
  useFlowState,
  useFlowActions,
  useFlowValidation,
  useNodeOperations,
  useFlowCanvas,
} from "./hooks";
import PropertyPanel from "./components/FlowBuilder/PropertyPanel";
import FlowToolbar from "./components/FlowBuilder/FlowToolbar";
import NodePalette from "./components/FlowBuilder/NodePalette";
import ChatInterface from "./components/Chat/ChatInterface";
import CustomNode from "./components/Nodes/CustomNode";

const nodeTypes_reactflow = {
  custom: CustomNode,
};

interface FlowBuilderProps {
  flowId?: string | null;
  onBackToList?: () => void;
}

const FlowBuilder: React.FC<FlowBuilderProps> = ({ flowId, onBackToList }) => {
  // Use custom hooks
  const flowState = useFlowState();

  const flowActions = useFlowActions({
    setNodes: flowState.setNodes,
    setEdges: flowState.setEdges,
    setFlowName: flowState.setFlowName,
    setFlowDescription: flowState.setFlowDescription,
    setVariables: flowState.setVariables,
    setFlowId: flowState.setFlowId,
    setIsActive: flowState.setIsActive,
    setIsDirty: flowState.setIsDirty,
    setIsLoading: flowState.setIsLoading,
    setError: flowState.setError,
    flowName: flowState.flowName,
    flowDescription: flowState.flowDescription,
    nodes: flowState.nodes,
    edges: flowState.edges,
    variables: flowState.variables,
    flowId: flowState.flowId,
    isActive: flowState.isActive,
  });

  const flowValidation = useFlowValidation({
    nodes: flowState.nodes,
    edges: flowState.edges,
    setIsChatOpen: flowState.setIsChatOpen,
  });

  const nodeOperations = useNodeOperations({
    setNodes: flowState.setNodes,
    setEdges: flowState.setEdges,
    setSelectedNode: flowState.setSelectedNode,
    setVariables: flowState.setVariables,
    selectedNode: flowState.selectedNode,
    nodes: flowState.nodes,
    markDirty: flowState.markDirty,
  });

  const canvasOperations = useFlowCanvas({
    setEdges: flowState.setEdges,
    setSelectedNode: flowState.setSelectedNode,
    addNodeToCanvas: nodeOperations.addNodeToCanvas,
    markDirty: flowState.markDirty,
  });

  // Load flow on mount if flowId is provided
  useEffect(() => {
    if (flowId && flowId !== flowState.flowId) {
      flowActions.loadFlow(flowId);
    }
  }, [flowId, flowState.flowId, flowActions]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <FlowToolbar
        onSave={flowActions.handleSave}
        onTest={flowValidation.handleTest}
        onValidate={flowValidation.handleValidate}
        onBackToList={onBackToList}
        isLoading={flowState.isLoading}
        flowName={flowState.flowName}
        setFlowName={flowState.setFlowName}
        flowDescription={flowState.flowDescription}
        setFlowDescription={flowState.setFlowDescription}
        isDirty={flowState.isDirty}
        error={flowState.error}
        isActive={flowState.isActive}
        onToggleActive={flowActions.handleToggleActive}
        flowId={flowState.flowId}
      />

      <div className="flex-1 flex overflow-hidden">
        <PropertyPanel
          selectedNode={flowState.selectedNode}
          onUpdateNode={nodeOperations.onUpdateNode}
          variables={flowState.variables}
          isCollapsed={flowState.isPropertyPanelCollapsed}
          setIsCollapsed={flowState.setIsPropertyPanelCollapsed}
        />
        <div
          className="flex-1 relative"
          ref={canvasOperations.reactFlowWrapper}
        >
          <ReactFlow
            nodes={flowState.nodes}
            edges={flowState.edges}
            onNodesChange={flowState.onNodesChange}
            onEdgesChange={flowState.onEdgesChange}
            onConnect={canvasOperations.onConnect}
            onNodeClick={nodeOperations.onNodeClick}
            onPaneClick={canvasOperations.onPaneClick}
            onNodesDelete={nodeOperations.onNodesDelete}
            onEdgesDelete={nodeOperations.onEdgesDelete}
            onInit={canvasOperations.setReactFlowInstance}
            onDrop={canvasOperations.onDrop}
            onDragOver={canvasOperations.onDragOver}
            nodeTypes={nodeTypes_reactflow}
            connectionMode={ConnectionMode.Loose}
            fitView
            deleteKeyCode={["Backspace", "Delete"]}
            multiSelectionKeyCode={["Meta", "Ctrl"]}
            className="bg-gray-50"
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              markerEnd: { type: MarkerType.ArrowClosed },
            }}
          >
            <Controls
              showZoom={true}
              showFitView={true}
              showInteractive={true}
              position="top-left"
            />
            <MiniMap
              nodeStrokeColor="#374151"
              nodeColor="#f3f4f6"
              nodeBorderRadius={8}
              className="bg-white"
              position="bottom-right"
            />
            <Background color="#e5e7eb" gap={20} />
          </ReactFlow>

          {/* Empty state */}
          {flowState.nodes.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center max-w-md mx-auto px-6">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Start Building Your Flow
                </h3>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Create powerful automated flows by connecting different types
                  of nodes. Drag nodes from the left panel or click on them to
                  add to your canvas.
                </p>
                <div className="text-sm text-gray-400 space-y-2 bg-gray-50 p-4 rounded-lg">
                  <p className="flex items-center justify-center gap-2">
                    <span>🎯</span>
                    <span>
                      Start with a <strong>Trigger</strong> node
                    </span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span>🔗</span>
                    <span>
                      Connect nodes by dragging between connection points
                    </span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span>⚙️</span>
                    <span>Configure each node in the properties panel</span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <span>🧪</span>
                    <span>Test your flow with the chat interface</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Flow Statistics Overlay */}
          {flowState.nodes.length > 0 && (
            <div className="absolute top-4 right-32 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Nodes: {flowState.nodes.length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Edges: {flowState.edges.length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Variables: {flowState.variables.length}
                </span>
              </div>
            </div>
          )}

          {/* Floating Add Node Button */}
          <button
            onClick={() => flowState.setIsNodePaletteOpen(true)}
            className="absolute top-3 right-12 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:shadow-xl"
            title="Add Node"
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Chat Testing Interface */}
      <ChatInterface
        isOpen={flowState.isChatOpen}
        onClose={() => flowState.setIsChatOpen(false)}
        flowId="test-flow"
        nodes={flowState.nodes}
        edges={flowState.edges}
      />

      {/* Node Palette Modal */}
      <NodePalette
        isOpen={flowState.isNodePaletteOpen}
        onClose={() => flowState.setIsNodePaletteOpen(false)}
        onAddNode={nodeOperations.addNodeToCanvas}
      />
    </div>
  );
};

export default FlowBuilder;
