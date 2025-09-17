import { useCallback, useEffect } from "react";
import { Node, Edge, OnNodesDelete, OnEdgesDelete, NodeMouseHandler } from "reactflow";
import { NodeType, FlowVariable, VariableType } from "../types/flow.types";
import { nodeTypes, getDefaultConfig } from "../types/nodeType.types";

type CustonNode = Node & { updated?: boolean; create?: boolean };

interface UseNodeOperationsParams {
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: CustonNode | null) => void;
  setVariables: (variables: FlowVariable[]) => void;
  selectedNode: CustonNode | null;
  nodes: Node[];
  markDirty: () => void;
}

interface UseNodeOperationsReturn {
  onNodeClick: NodeMouseHandler;
  onUpdateNode: (nodeId: string, newData: any) => void;
  addNodeToCanvas: (type: NodeType, position?: { x: number; y: number }) => void;
  onNodesDelete: OnNodesDelete;
  onEdgesDelete: OnEdgesDelete;
}

export const useNodeOperations = (params: UseNodeOperationsParams): UseNodeOperationsReturn => {
  const {
    setNodes,
    setEdges,
    setSelectedNode,
    setVariables,
    selectedNode,
    nodes,
    markDirty,
  } = params;

  // Handle node selection
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
  }, [setSelectedNode]);

  // Update node data
  const onUpdateNode = useCallback(
    (nodeId: string, newData: any): void => {
      setNodes((nds: Node[]) =>
        nds.map((node: Node) =>
          node.id === nodeId ? { ...node, data: newData, updated: true } : node
        )
      );

      // Update selected node if it's the one being updated
      if (selectedNode?.id === nodeId) {
        setSelectedNode({ ...selectedNode, data: newData, updated: true });
      }

      markDirty();
    },
    [selectedNode, setNodes, setSelectedNode, markDirty]
  );

  // Add node to canvas
  const addNodeToCanvas = useCallback(
    (
      type: NodeType,
      position: { x: number; y: number } = { x: 100, y: 100 }
    ): void => {
      const nodeConfig = nodeTypes.find((nt) => nt.type === type);
      const newNode: CustonNode = {
        id: `node-${Date.now()}`,
        type: "custom",
        position,
        create: true,
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
    [selectedNode, setEdges, setSelectedNode, markDirty]
  );

  // Handle edge deletion
  const onEdgesDelete: OnEdgesDelete = useCallback(() => {
    markDirty();
  }, [markDirty]);

  // Auto-update variables based on INPUT nodes
  useEffect(() => {
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
  }, [nodes, setVariables]);

  return {
    onNodeClick,
    onUpdateNode,
    addNodeToCanvas,
    onNodesDelete,
    onEdgesDelete,
  };
};