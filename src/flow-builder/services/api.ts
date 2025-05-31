import { FlowListResponse, FlowResponse } from "../types/flow.types";
import { MarkerType } from "reactflow";
import {
  PaginationParams,
  PaginatedResponse,
  CreateFlowRequest,
  UpdateFlowRequest,
  FlowValidationResponse,
  TestFlowRequest,
  TestFlowResponse,
  ContinueSessionRequest,
  FlowSessionData,
  FlowSessionResponse,
} from "./api.types";
import { apiClient } from "./api.config";

// Flow API Service
export const flowApi = {
  // List all flows with pagination
  async listFlows(
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<FlowListResponse> {
    const response = await apiClient.get("/flows", { params });
    return response.data;
  },

  // Get flow by ID
  async getFlow(flowId: string): Promise<FlowResponse> {
    const response = await apiClient.get(`/flows/${flowId}`);
    return response.data;
  },

  // Create new flow
  async createFlow(flowData: CreateFlowRequest): Promise<FlowResponse> {
    const response = await apiClient.post("/flows", flowData);
    return response.data;
  },

  // Update existing flow
  async updateFlow(
    flowId: string,
    flowData: UpdateFlowRequest
  ): Promise<FlowResponse> {
    return apiClient.put(`/flows/${flowId}`, flowData).then(({ data }) => data);
  },

  // Delete flow
  async deleteFlow(flowId: string): Promise<void> {
    await apiClient.delete(`/flows/${flowId}`);
  },

  // Active flow
  async activeFlow(flowId: string): Promise<void> {
    await apiClient.patch(`/flows/${flowId}`, { isActive: true });
  },

  // Deactive flow
  async deactiveFlow(flowId: string): Promise<void> {
    await apiClient.patch(`/flows/${flowId}`, { isActive: false });
  },

  // Validate flow
  async validateFlow(flowId: string): Promise<FlowValidationResponse> {
    const response = await apiClient.post(`/flows/${flowId}/validate`);
    return response.data;
  },

  // Test flow execution
  async testFlow(
    flowId: string,
    testData: TestFlowRequest
  ): Promise<TestFlowResponse> {
    const response = await apiClient.post(`/flows/${flowId}/test`, testData);
    return response.data;
  },

  // Continue flow session
  async continueSession(
    sessionId: string,
    requestData: ContinueSessionRequest
  ): Promise<any> {
    const response = await apiClient.post(
      `/sessions/${sessionId}/continue`,
      requestData
    );
    return response.data;
  },

  // Get active flows only
  async getActiveFlows(): Promise<FlowListResponse> {
    const response = await apiClient.get("/flows/active");
    return response.data;
  },

  // Get inactive flows only
  async getInactiveFlows(): Promise<FlowListResponse> {
    const response = await apiClient.get("/flows/inactive");
    return response.data;
  },

  // Duplicate flow
  async duplicateFlow(flowId: string): Promise<FlowResponse> {
    const response = await apiClient.post(`/flows/${flowId}/duplicate`);
    return response.data;
  },

  // Get sessions for a specific flow
  async getFlowSessions(
    flowId: string,
    params: PaginationParams = { page: 1, limit: 10 }
  ): Promise<PaginatedResponse<FlowSessionData>> {
    const response = await apiClient.get(`/flows/${flowId}/sessions`, {
      params,
    });
    return response.data;
  },

  // Get flow session with complete details (flow + session + nodes + edges)
  async getFlowSession(sessionId: string): Promise<FlowSessionResponse> {
    const response = await apiClient.get(`/flows/sessions/${sessionId}`);
    return response.data;
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
  updated: reactFlowNode?.updated,
  create: reactFlowNode?.create,
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
