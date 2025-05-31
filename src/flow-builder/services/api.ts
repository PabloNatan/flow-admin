import { FlowListResponse, FlowResponse } from "../types/flow.types";
import { MarkerType } from "reactflow";

// API Configuration
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "your-api-key";
const APPLICATION_ID = process.env.NEXT_PUBLIC_APP_ID!;

// Default headers for API requests
const getHeaders = () => ({
  "Content-Type": "application/json",
  "x-api-key": API_KEY,
  "x-application-id": APPLICATION_ID,
});

// API Error handling
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
};

// Flow API Service
export const flowApi = {
  // List all flows with pagination
  async listFlows(
    page: number = 1,
    limit: number = 10
  ): Promise<FlowListResponse> {
    const response = await fetch(
      `${API_BASE_URL}/flows?page=${page}&limit=${limit}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );
    return handleResponse(response);
  },

  // Get flow by ID
  async getFlow(flowId: string): Promise<FlowResponse> {
    const response = await fetch(`${API_BASE_URL}/flows/${flowId}`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Create new flow
  async createFlow(flowData: {
    name: string;
    description?: string;
    nodes: any[];
    edges: any[];
    variables?: any[];
  }): Promise<FlowResponse> {
    const response = await fetch(`${API_BASE_URL}/flows`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(flowData),
    });
    return handleResponse(response);
  },

  // Update existing flow
  async updateFlow(
    flowId: string,
    flowData: {
      name?: string;
      description?: string;
      nodes?: any[];
      edges?: any[];
      variables?: any[];
    }
  ): Promise<FlowResponse> {
    const response = await fetch(`${API_BASE_URL}/flows/${flowId}`, {
      method: "PATCH",
      headers: getHeaders(),
      body: JSON.stringify(flowData),
    });
    return handleResponse(response);
  },

  // Delete flow
  async deleteFlow(flowId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/flows/${flowId}`, {
      method: "DELETE",
      headers: getHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }
  },

  // Validate flow
  async validateFlow(flowId: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metrics: {
      nodeCount: number;
      edgeCount: number;
      maxDepth: number;
      hasLoops: boolean;
      unreachableNodes: string[];
    };
  }> {
    const response = await fetch(`${API_BASE_URL}/flows/${flowId}/validate`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Test flow execution
  async testFlow(
    flowId: string,
    testData: {
      userId?: string;
      initialVariables?: Record<string, any>;
    }
  ): Promise<{
    sessionId: string;
    status: string;
    currentNode: {
      id: string;
      type: string;
      name: string;
    };
    result: any;
    waitingForInput: boolean;
    variables: Record<string, any>;
    nextAction: "continue" | "wait_for_input" | "completed";
  }> {
    const response = await fetch(`${API_BASE_URL}/flows/${flowId}/test`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(testData),
    });
    return handleResponse(response);
  },

  // Continue flow session
  async continueSession(
    sessionId: string,
    userResponse: {
      type: string;
      content: any;
    }
  ): Promise<any> {
    const response = await fetch(
      `${API_BASE_URL}/sessions/${sessionId}/continue`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ userResponse }),
      }
    );
    return handleResponse(response);
  },

  // Get active flows only
  async getActiveFlows(): Promise<FlowListResponse> {
    const response = await fetch(`${API_BASE_URL}/flows/active`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Get inactive flows only
  async getInactiveFlows(): Promise<FlowListResponse> {
    const response = await fetch(`${API_BASE_URL}/flows/inactive`, {
      method: "GET",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },

  // Duplicate flow
  async duplicateFlow(flowId: string): Promise<FlowResponse> {
    const response = await fetch(`${API_BASE_URL}/flows/${flowId}/duplicate`, {
      method: "POST",
      headers: getHeaders(),
    });
    return handleResponse(response);
  },
};

// Helper function to transform API node data to React Flow format
export const transformApiNodeToReactFlow = (apiNode: any) => ({
  id: apiNode.id,
  type: "custom",
  position: apiNode.position,
  data: {
    type: apiNode.type,
    config: apiNode.config,
  },
});

// Helper function to transform React Flow node data to API format
export const transformReactFlowNodeToApi = (reactFlowNode: any) => ({
  id: reactFlowNode.id,
  type: reactFlowNode.data.type,
  position: reactFlowNode.position,
  config: reactFlowNode.data.config,
});

// Helper function to transform API edge data to React Flow format
export const transformApiEdgeToReactFlow = (apiEdge: any) => ({
  id: apiEdge.id,
  source: apiEdge.sourceId,
  target: apiEdge.targetId,
  sourceHandle: apiEdge.sourceHandle,
  targetHandle: apiEdge.targetHandle,
  type: "smoothstep",
  animated: true,
  markerEnd: { type: MarkerType.ArrowClosed },
});

// Helper function to transform React Flow edge data to API format
export const transformReactFlowEdgeToApi = (reactFlowEdge: any) => ({
  id: reactFlowEdge.id,
  sourceId: reactFlowEdge.source,
  targetId: reactFlowEdge.target,
  sourceHandle: reactFlowEdge.sourceHandle,
  targetHandle: reactFlowEdge.targetHandle,
});
