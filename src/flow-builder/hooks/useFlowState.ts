import { useCallback, useState } from "react";
import { ConnectionLineType, Edge, Node, useEdgesState, useNodesState } from "reactflow";
import { FlowVariable, ICustonNode } from "../types/flow.types";

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
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "node-1768752705653",
      type: "custom",
      position: {
        x: -131,
        y: 100
      },
      data: {
        type: "TRIGGER",
        config: {
          name: "Trigger",
          event: "manual"
        }
      },
      width: 180,
      height: 56,
      selected: false,
      positionAbsolute: {
        x: -131,
        y: 100
      },
      dragging: false
    },
    {
      id: "node-1768752710137",
      type: "custom",
      position: {
        x: 113.5,
        y: 101
      },
      data: {
        type: "MESSAGE",
        config: {
          name: "Message",
          messageType: "TEXT",
          content: ""
        }
      },
      width: 180,
      height: 72,
      selected: true,
      positionAbsolute: {
        x: 113.5,
        y: 101
      },
      dragging: true
    }
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([
    {
      id: "edge-1768752710137",
      source: "node-1768752705653",
      target: "node-1768752710137",
      type: ConnectionLineType.Bezier,
      markerEnd: undefined,
      animated: true,
      zIndex: 1000,
      
    }
  ]);
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
