// Core Flow Types

export enum NodeType {
  TRIGGER = "TRIGGER",
  MESSAGE = "MESSAGE",
  INPUT = "INPUT",
  CONDITION = "CONDITION",
  DELAY = "DELAY",
  ACTION = "ACTION",
  END = "END",
}

export enum MessageType {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
  AUDIO = "AUDIO",
  JSON = "JSON",
  FILE = "FILE",
}

export enum ResponseType {
  TEXT = "TEXT",
  PHONE = "PHONE",
  EMAIL = "EMAIL",
  NUMBER = "NUMBER",
  JSON = "JSON",
  FILE = "FILE",
}

export enum VariableType {
  STRING = "STRING",
  NUMBER = "NUMBER",
  BOOLEAN = "BOOLEAN",
  JSON = "JSON",
  ARRAY = "ARRAY",
}

export enum SessionStatus {
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  COMPLETED = "COMPLETED",
  ABANDONED = "ABANDONED",
  ERROR = "ERROR",
}

export enum ActionType {
  HTTP_REQUEST = "HTTP_REQUEST",
  WEBHOOK = "WEBHOOK",
  EMAIL = "EMAIL",
  SMS = "SMS",
}

export enum DelayType {
  FIXED = "FIXED",
  VARIABLE = "VARIABLE",
}

export const ConditionOperators = [
  "equals",
  "not_equals",
  "greater_than",
  "greater_than_or_equal",
  "less_than",
  "less_than_or_equal",
  "contains",
  "starts_with",
  "ends_with",
  "in",
  "not_in",
  "is_empty",
  "is_not_empty",
  "regex",
] as const;

export type ConditionOperator = (typeof ConditionOperators)[number];

// Base Configurations for each node type
export interface BaseTriggerConfig {
  name: string;
  event: "manual" | "webhook" | "scheduled" | "user_action";
  description?: string;
  webhookUrl?: string;
  schedule?: string;
}

export interface BaseMessageConfig {
  name: string;
  messageType: MessageType;
  content: string | object;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface InputValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  allowedTypes?: string[];
  maxFileSize?: number;
  errorMessage?: string;
}

export interface BaseInputConfig {
  name: string;
  prompt: string;
  responseType: ResponseType;
  required: boolean;
  variableName: string;
  validation?: InputValidation;
}

export interface Condition {
  id: string;
  variable: string;
  operator: ConditionOperator;
  value: string | number | boolean;
  label: string;
}

export interface BaseConditionConfig {
  name: string;
  conditions: Condition[];
  defaultCondition: {
    id: string;
    label: string;
  };
}

export interface BaseDelayConfig {
  name: string;
  delayType: DelayType;
  delayMs?: number;
  delayVariable?: string;
  description?: string;
}

export interface BaseActionConfig {
  name: string;
  actionType: ActionType;
  url?: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: object;
  to?: string;
  subject?: string;
  htmlBody?: string;
  textBody?: string;
  phoneNumber?: string;
  message?: string;
}

export interface BaseEndConfig {
  name: string;
  message: string;
  returnData?: object;
}

// Union type for all node configurations
export type NodeConfig =
  | BaseTriggerConfig
  | BaseMessageConfig
  | BaseInputConfig
  | BaseConditionConfig
  | BaseDelayConfig
  | BaseActionConfig
  | BaseEndConfig;

// Flow Node Interface
export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    type: NodeType;
    config: NodeConfig;
  };
}

// Flow Edge Interface
export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  label?: string;
}

// Flow Variable Interface
export interface FlowVariable {
  id: string;
  name: string;
  type: VariableType;
  defaultValue?: any;
  nodeId?: string;
}

// Flow Interface
export interface Flow {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  createdAt: string;
  updatedAt: string;
}

// Chat Message Interface
export interface ChatMessage {
  id: string | number;
  type: "user" | "bot" | "system";
  content: string;
  messageType?: MessageType;
  responseType?: ResponseType;
  nodeId?: string;
  timestamp: Date;
}

// Validation Result Interface
export interface ValidationError {
  field?: string;
  message: string;
  nodeId?: string;
  severity: "error" | "warning";
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  metrics?: {
    nodeCount: number;
    edgeCount: number;
    maxDepth: number;
    hasLoops: boolean;
    unreachableNodes: string[];
  };
}

// API Response Types
export interface FlowListResponse {
  data: Array<{
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    nodeCount: number;
    sessionCount: number;
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export interface FlowResponse {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: Array<{
    id: string;
    type: NodeType;
    position: { x: number; y: number };
    config: NodeConfig;
  }>;
  edges: Array<{
    id: string;
    sourceId: string;
    targetId: string;
    sourceHandle?: string;
    targetHandle?: string;
  }>;
  variables: FlowVariable[];
}

// Session and Execution Types
export interface FlowSession {
  id: string;
  flowId: string;
  userId?: string;
  currentNodeId?: string;
  status: SessionStatus;
  variables: Record<string, any>;
  startedAt: string;
  lastActiveAt: string;
  completedAt?: string;
}

export interface SessionMessage {
  id: string;
  sessionId: string;
  nodeId: string;
  type: MessageType;
  content: any;
  sentAt: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
}

export interface SessionResponse {
  id: string;
  sessionId: string;
  nodeId: string;
  type: ResponseType;
  content: any;
  receivedAt: string;
}
