export interface ApiConfig {
  baseURL: string;
  apiKey: string;
  applicationId: string;
}

export interface ApiHeaders {
  'Content-Type': string;
  'x-api-key': string;
  'x-application-id': string;
}

export interface ApiErrorResponse {
  message: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalCountOfRegisters: number;
}

export interface CreateFlowRequest {
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  variables?: any[];
}

export interface UpdateFlowRequest {
  name?: string;
  description?: string;
  nodes?: any[];
  edges?: any[];
  variables?: any[];
}

export interface FlowValidationResponse {
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
}

export interface TestFlowRequest {
  userId?: string;
  initialVariables?: Record<string, any>;
}

export interface TestFlowResponse {
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
}

export interface ContinueSessionRequest {
  userResponse: {
    type: string;
    content: any;
  };
}

export interface FlowSessionData {
  sessionId: string;
  status: "RUNNING" | "PAUSED" | "COMPLETED" | "ERROR";
  currentNodeId: string;
  waitingForInput: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlowSessionResponse {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applicationId: string;
  session: {
    id: string;
    flowId: string;
    userId: string;
    currentNodeId: string;
    status: "RUNNING" | "PAUSED" | "COMPLETED" | "ERROR";
    variables: Record<string, any>;
    startedAt: string;
    completedAt: string | null;
    lastActiveAt: string;
  };
  nodes: Array<{
    id: string;
    flowId: string;
    type: "TRIGGER" | "MESSAGE" | "INPUT" | "ACTION" | "CONDITION" | "DELAY" | "END";
    position: { x: number; y: number };
    config: any;
    createdAt: string;
    updatedAt: string;
  }>;
  edges: Array<{
    id: string;
    flowId: string;
    sourceId: string;
    targetId: string;
    condition: any;
    label: string | null;
    createdAt: string;
  }>;
}