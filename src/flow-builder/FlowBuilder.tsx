"use client";

import React, { useState, useCallback, useRef } from "react";
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  MarkerType,
  ConnectionMode,
  Node,
  Edge,
  Connection,
  ReactFlowInstance,
  OnConnect,
  NodeMouseHandler,
  OnNodesDelete,
  OnEdgesDelete,
} from "reactflow";

import CustomNode from "./components/Nodes/CustomNode";
import { FlowVariable, NodeType, VariableType } from "./types/flow.types";
import { getDefaultConfig, nodeTypes } from "./types/nodeType.types";
import FlowToolbar from "./components/FlowBuilder/FlowToolbar";
import NodePalette from "./components/FlowBuilder/NodePalette";
import PropertyPanel from "./components/FlowBuilder/PropertyPanel";
import ChatInterface from "./components/Chat/ChatInterface";

// Components

// Types and utilities

const nodeTypes_reactflow = {
  custom: CustomNode,
};

const FlowBuilder: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [flowName, setFlowName] = useState<string>("New Flow");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [variables, setVariables] = useState<FlowVariable[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  // UI state
  const [isNodePaletteCollapsed, setIsNodePaletteCollapsed] =
    useState<boolean>(false);
  const [isPropertyPanelCollapsed, setIsPropertyPanelCollapsed] =
    useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Mark flow as dirty when changes occur
  const markDirty = useCallback((): void => {
    setIsDirty(true);
  }, []);

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  // Handle edge connection
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      const newEdge: Edge = {
        ...params,
        id: `edge-${Date.now()}`,
        type: "smoothstep",
        source: "any",
        target: "any",
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed },
      };
      setEdges((eds: Edge[]) => addEdge(newEdge, eds));
      markDirty();
    },
    [setEdges, markDirty]
  );

  // Handle canvas click (deselect nodes)
  const onPaneClick = useCallback((): void => {
    setSelectedNode(null);
  }, []);

  // Handle drag and drop from palette
  const onDragOver = useCallback((event: React.DragEvent): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent): void => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const type = event.dataTransfer.getData(
        "application/reactflow"
      ) as NodeType;

      if (
        typeof type === "undefined" ||
        !type ||
        !reactFlowInstance ||
        !reactFlowBounds
      ) {
        return;
      }

      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });

      addNodeToCanvas(type, position);
    },
    [reactFlowInstance]
  );

  // Add node to canvas
  const addNodeToCanvas = useCallback(
    (
      type: NodeType,
      position: { x: number; y: number } = { x: 100, y: 100 }
    ): void => {
      const nodeConfig = nodeTypes.find((nt) => nt.type === type);
      const newNode: Node = {
        id: `node-${Date.now()}`,
        type: "custom",
        position,
        data: {
          type,
          config: {
            ...getDefaultConfig(type),
            name: nodeConfig?.label || type,
          },
        },
      };

      setNodes((nds: Node[]) => nds.concat(newNode));
      markDirty();
    },
    [setNodes, markDirty]
  );

  // Update node data
  const onUpdateNode = useCallback(
    (nodeId: string, newData: any): void => {
      setNodes((nds: Node[]) =>
        nds.map((node: Node) =>
          node.id === nodeId ? { ...node, data: newData } : node
        )
      );

      // Update selected node if it's the one being updated
      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, data: newData });
      }

      markDirty();
    },
    [selectedNode, setNodes, markDirty]
  );

  // Handle node deletion
  const onNodesDelete: OnNodesDelete = useCallback(
    (deletedNodes) => {
      const deletedNodeIds = deletedNodes.map((node) => node.id);

      // Remove related edges
      setEdges((eds: Edge[]) =>
        eds.filter(
          (edge: Edge) =>
            !deletedNodeIds.includes(edge.source) &&
            !deletedNodeIds.includes(edge.target)
        )
      );

      // Clear selection if deleted node was selected
      if (selectedNode && deletedNodeIds.includes(selectedNode.id)) {
        setSelectedNode(null);
      }

      markDirty();
    },
    [selectedNode, setEdges, markDirty]
  );

  // Handle edge deletion
  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    markDirty();
  }, [markDirty]);

  // Flow actions
  const handleSave = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const flowData = {
        name: flowName,
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.type,
          position: node.position,
          config: node.data.config,
        })),
        edges: edges.map((edge) => ({
          id: edge.id,
          sourceId: edge.source,
          targetId: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle,
        })),
        variables,
      };

      console.log("Saving flow:", flowData);
      alert("Flow saved successfully!");
      setIsDirty(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert("Error saving flow: " + errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = (): void => {
    if (nodes.length === 0) {
      alert("Please add some nodes to test the flow");
      return;
    }

    const triggerNodes = nodes.filter((n) => n.data.type === NodeType.TRIGGER);
    if (triggerNodes.length === 0) {
      alert("Please add a TRIGGER node to start the flow");
      return;
    }

    setIsChatOpen(true);
  };

  const handleValidate = (): void => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for trigger node
    const triggerNodes = nodes.filter((n) => n.data.type === NodeType.TRIGGER);
    if (triggerNodes.length === 0) {
      errors.push("Flow must have at least one TRIGGER node");
    }
    if (triggerNodes.length > 1) {
      warnings.push("Flow has multiple TRIGGER nodes");
    }

    // Check for end nodes
    const endNodes = nodes.filter((n) => n.data.type === NodeType.END);
    if (endNodes.length === 0) {
      warnings.push("Flow has no END node - users may get stuck");
    }

    // Check for orphaned nodes
    nodes.forEach((node) => {
      const hasIncoming = edges.some((edge) => edge.target === node.id);
      const hasOutgoing = edges.some((edge) => edge.source === node.id);

      if (!hasIncoming && node.data.type !== NodeType.TRIGGER) {
        warnings.push(
          `Node "${node.data.config.name}" has no incoming connections`
        );
      }
      if (!hasOutgoing && node.data.type !== NodeType.END) {
        warnings.push(
          `Node "${node.data.config.name}" has no outgoing connections`
        );
      }
    });

    // Check for required configurations
    nodes.forEach((node) => {
      const config = node.data.config;
      switch (node.data.type) {
        case NodeType.MESSAGE:
          if (!config.content) {
            errors.push(`Message node "${config.name}" has no content`);
          }
          break;
        case NodeType.INPUT:
          if (!config.prompt) {
            errors.push(`Input node "${config.name}" has no prompt`);
          }
          if (!config.variableName) {
            warnings.push(
              `Input node "${config.name}" has no variable name - response won't be stored`
            );
          }
          break;
        case NodeType.CONDITION:
          if (!config.conditions || config.conditions.length === 0) {
            errors.push(
              `Condition node "${config.name}" has no conditions defined`
            );
          }
          break;
        case NodeType.ACTION:
          if (
            !config.url &&
            (config.actionType === "HTTP_REQUEST" ||
              config.actionType === "WEBHOOK")
          ) {
            errors.push(`Action node "${config.name}" has no URL configured`);
          }
          break;
      }
    });

    // Create validation message
    let message = "";
    if (errors.length > 0) {
      message = `❌ Validation failed:\n${errors
        .map((e) => `• ${e}`)
        .join("\n")}`;
    } else if (warnings.length > 0) {
      message = `⚠️ Validation passed with warnings:\n${warnings
        .map((w) => `• ${w}`)
        .join("\n")}`;
    } else {
      message = "✅ Flow validation successful! No errors or warnings found.";
    }

    if (warnings.length > 0 && errors.length === 0) {
      message +=
        "\n\nWarnings don't prevent flow execution but should be reviewed.";
    }

    alert(message);
  };

  // Auto-update variables based on INPUT nodes
  React.useEffect(() => {
    const inputNodes = nodes.filter((n) => n.data.type === NodeType.INPUT);
    const newVariables: FlowVariable[] = inputNodes
      .filter((node) => node.data.config?.variableName)
      .map((node) => ({
        id: `var-${node.id}`,
        name: node.data.config.variableName,
        type: VariableType.STRING, // Could be enhanced based on responseType
        defaultValue: null,
        nodeId: node.id,
      }));

    setVariables(newVariables);
  }, [nodes]);

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <FlowToolbar
        onSave={handleSave}
        onTest={handleTest}
        onValidate={handleValidate}
        isLoading={isLoading}
        flowName={flowName}
        setFlowName={setFlowName}
        isDirty={isDirty}
      />

      <div className="flex-1 flex overflow-hidden">
        <NodePalette
          onAddNode={addNodeToCanvas}
          isCollapsed={isNodePaletteCollapsed}
          setIsCollapsed={setIsNodePaletteCollapsed}
        />

        <div className="flex-1 relative" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onPaneClick={onPaneClick}
            onNodesDelete={onNodesDelete}
            onEdgesDelete={onEdgesDelete}
            onInit={setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
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
          {nodes.length === 0 && (
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
          {nodes.length > 0 && (
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-sm border border-gray-200 px-3 py-2">
              <div className="flex items-center gap-4 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  Nodes: {nodes.length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  Edges: {edges.length}
                </span>
                <span className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  Variables: {variables.length}
                </span>
              </div>
            </div>
          )}
        </div>

        <PropertyPanel
          selectedNode={selectedNode}
          onUpdateNode={onUpdateNode}
          variables={variables}
          isCollapsed={isPropertyPanelCollapsed}
          setIsCollapsed={setIsPropertyPanelCollapsed}
        />
      </div>

      {/* Chat Testing Interface */}
      <ChatInterface
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        flowId="test-flow"
        nodes={nodes}
        edges={edges}
      />
    </div>
  );
};

export default FlowBuilder;
