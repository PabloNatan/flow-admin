import { useCallback, useRef, useState } from "react";
import {
  ReactFlowInstance,
  Connection,
  Edge,
  addEdge,
  MarkerType,
  OnConnect,
} from "reactflow";
import { ICustonNode, NodeType } from "../types/flow.types";

interface UseFlowCanvasParams {
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setSelectedNode: (node: ICustonNode | null) => void;
  addNodeToCanvas: (
    type: NodeType,
    position?: { x: number; y: number }
  ) => void;
  markDirty: () => void;
}

interface UseFlowCanvasReturn {
  reactFlowWrapper: React.RefObject<HTMLDivElement>;
  reactFlowInstance: ReactFlowInstance | null;
  setReactFlowInstance: (instance: ReactFlowInstance | null) => void;
  onConnect: OnConnect;
  onPaneClick: () => void;
  onDragOver: (event: React.DragEvent) => void;
  onDrop: (event: React.DragEvent) => void;
}

export const useFlowCanvas = (
  params: UseFlowCanvasParams
): UseFlowCanvasReturn => {
  const { setEdges, setSelectedNode, addNodeToCanvas, markDirty } = params;

  const reactFlowWrapper = useRef<HTMLDivElement>(null as any);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  // Handle edge connection
  const onConnect: OnConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;

      const newEdge: Edge = {
        id: `edge-${Date.now()}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle,
        type: "smoothstep",
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
  }, [setSelectedNode]);

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
    [reactFlowInstance, addNodeToCanvas]
  );

  return {
    reactFlowWrapper,
    reactFlowInstance,
    setReactFlowInstance,
    onConnect,
    onPaneClick,
    onDragOver,
    onDrop,
  };
};
