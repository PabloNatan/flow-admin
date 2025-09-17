import { useState, useCallback } from "react";
import { useNodesState, useEdgesState, Node, Edge } from "reactflow";
import { ICustonNode, FlowVariable } from "../types/flow.types";

interface UseFlowStateReturn {
  // Nodes and edges
  nodes: Node[];
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  onNodesChange: (changes: any) => void;
  edges: Edge[];
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  onEdgesChange: (changes: any) => void;

  // Selected node
  selectedNode: ICustonNode | null;
  setSelectedNode: (node: ICustonNode | null) => void;

  // Flow metadata
  flowName: string;
  setFlowName: (name: string) => void;
  flowId: string | null;
  setFlowId: (id: string | null) => void;
  flowDescription: string;
  setFlowDescription: (description: string) => void;

  // Flow state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  variables: FlowVariable[];
  setVariables: (variables: FlowVariable[]) => void;
  isDirty: boolean;
  setIsDirty: (dirty: boolean) => void;
  isActive: boolean;
  setIsActive: (active: boolean) => void;

  // UI state
  isNodePaletteOpen: boolean;
  setIsNodePaletteOpen: (open: boolean) => void;
  isPropertyPanelCollapsed: boolean;
  setIsPropertyPanelCollapsed: (collapsed: boolean) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;

  // Utility functions
  markDirty: () => void;
}

export const useFlowState = (): UseFlowStateReturn => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<ICustonNode | null>(null);
  const [flowName, setFlowName] = useState<string>("New Flow");
  const [flowId, setFlowId] = useState<string | null>(null);
  const [flowDescription, setFlowDescription] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [variables, setVariables] = useState<FlowVariable[]>([]);
  const [isDirty, setIsDirty] = useState<boolean>(false);
  const [isActive, setIsActive] = useState<boolean>(false);

  // UI state
  const [isNodePaletteOpen, setIsNodePaletteOpen] = useState<boolean>(false);
  const [isPropertyPanelCollapsed, setIsPropertyPanelCollapsed] =
    useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  // Mark flow as dirty when changes occur
  const markDirty = useCallback((): void => {
    setIsDirty(true);
  }, []);

  return {
    nodes,
    setNodes,
    onNodesChange,
    edges,
    setEdges,
    onEdgesChange,
    selectedNode,
    setSelectedNode,
    flowName,
    setFlowName,
    flowId,
    setFlowId,
    flowDescription,
    setFlowDescription,
    isLoading,
    setIsLoading,
    error,
    setError,
    variables,
    setVariables,
    isDirty,
    setIsDirty,
    isActive,
    setIsActive,
    isNodePaletteOpen,
    setIsNodePaletteOpen,
    isPropertyPanelCollapsed,
    setIsPropertyPanelCollapsed,
    isChatOpen,
    setIsChatOpen,
    markDirty,
  };
};
