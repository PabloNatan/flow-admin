import { useCallback } from "react";
import { Node, Edge } from "reactflow";
import { FlowVariable } from "../types/flow.types";
import {
  flowApi,
  ApiError,
  transformApiNodeToReactFlow,
  transformApiEdgeToReactFlow,
  transformReactFlowNodeToApi,
  transformReactFlowEdgeToApi,
} from "../services";

interface UseFlowActionsParams {
  setNodes: (nodes: Node[] | ((nodes: Node[]) => Node[])) => void;
  setEdges: (edges: Edge[] | ((edges: Edge[]) => Edge[])) => void;
  setFlowName: (name: string) => void;
  setFlowDescription: (description: string) => void;
  setVariables: (variables: FlowVariable[]) => void;
  setFlowId: (id: string | null) => void;
  setIsActive: (active: boolean) => void;
  setIsDirty: (dirty: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  flowName: string;
  flowDescription: string;
  nodes: Node[];
  edges: Edge[];
  variables: FlowVariable[];
  flowId: string | null;
  isActive: boolean;
}

interface UseFlowActionsReturn {
  loadFlow: (id: string) => Promise<void>;
  saveFlow: () => Promise<any>;
  handleSave: () => Promise<void>;
  handleToggleActive: () => Promise<void>;
}

export const useFlowActions = (params: UseFlowActionsParams): UseFlowActionsReturn => {
  const {
    setNodes,
    setEdges,
    setFlowName,
    setFlowDescription,
    setVariables,
    setFlowId,
    setIsActive,
    setIsDirty,
    setIsLoading,
    setError,
    flowName,
    flowDescription,
    nodes,
    edges,
    variables,
    flowId,
    isActive,
  } = params;

  // Load flow data from API
  const loadFlow = useCallback(
    async (id: string) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await flowApi.getFlow(id);

        // Transform API data to React Flow format
        const transformedNodes = response.nodes.map(transformApiNodeToReactFlow);
        const transformedEdges = response.edges.map(transformApiEdgeToReactFlow);

        setNodes(transformedNodes);
        setEdges(transformedEdges);
        setFlowName(response.name);
        setFlowDescription(response.description || "");
        setVariables(response.variables || []);
        setFlowId(response.id);
        setIsActive(response.isActive);
        setIsDirty(false);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to load flow: ${err.message}`);
        } else {
          setError("Failed to load flow. Please try again.");
        }
        console.error("Error loading flow:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [setNodes, setEdges, setFlowName, setFlowDescription, setVariables, setFlowId, setIsActive, setIsDirty, setIsLoading, setError]
  );

  // Save flow to API
  const saveFlow = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const flowData = {
        name: flowName,
        description: flowDescription,
        nodes: nodes.map(transformReactFlowNodeToApi),
        edges: edges.map(transformReactFlowEdgeToApi),
        variables,
      };

      let response;
      if (flowId) {
        response = await flowApi.updateFlow(flowId, flowData);
      } else {
        response = await flowApi.createFlow(flowData);
        setFlowId(response.id);
      }

      setIsDirty(false);
      return response;
    } catch (err) {
      if (err instanceof ApiError) {
        throw new Error(`Failed to save flow: ${err.message}`);
      } else {
        throw new Error("Failed to save flow. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [flowName, flowDescription, nodes, edges, variables, flowId, setFlowId, setIsDirty, setIsLoading, setError]);

  // Handle save with user feedback
  const handleSave = async (): Promise<void> => {
    try {
      await saveFlow();
      alert("Flow saved successfully!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert("Error saving flow: " + errorMessage);
    }
  };

  // Handle activate/deactivate flow
  const handleToggleActive = async (): Promise<void> => {
    if (!flowId) {
      alert("Please save the flow first before activating/deactivating");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      if (isActive) {
        await flowApi.deactiveFlow(flowId);
        setIsActive(false);
        alert("Flow deactivated successfully!");
      } else {
        await flowApi.activeFlow(flowId);
        setIsActive(true);
        alert("Flow activated successfully!");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          `Failed to ${isActive ? "deactivate" : "activate"} flow: ${err.message}`
        );
        alert(
          `Error ${isActive ? "deactivating" : "activating"} flow: ${err.message}`
        );
      } else {
        setError(
          `Failed to ${isActive ? "deactivate" : "activate"} flow. Please try again.`
        );
        alert(
          `Error ${isActive ? "deactivating" : "activating"} flow. Please try again.`
        );
      }
      console.error(`Error ${isActive ? "deactivating" : "activating"} flow:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loadFlow,
    saveFlow,
    handleSave,
    handleToggleActive,
  };
};