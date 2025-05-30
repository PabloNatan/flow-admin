import { ForwardRefExoticComponent, SVGProps } from "react";
import {
  PlayIcon,
  ChatBubbleLeftRightIcon,
  PencilIcon,
  ArrowPathRoundedSquareIcon,
  ClockIcon,
  BoltIcon,
  FlagIcon,
} from "@heroicons/react/24/outline";
import {
  NodeType,
  BaseTriggerConfig,
  BaseMessageConfig,
  BaseInputConfig,
  BaseConditionConfig,
  BaseDelayConfig,
  BaseActionConfig,
  BaseEndConfig,
} from "./flow.types";

export interface NodeTypeConfig {
  type: NodeType;
  icon: ForwardRefExoticComponent<Omit<SVGProps<SVGSVGElement>, "ref">>;
  label: string;
  description: string;
  color: string;
}

export const nodeTypes: NodeTypeConfig[] = [
  {
    type: NodeType.TRIGGER,
    icon: PlayIcon,
    label: "Trigger",
    description: "Start the flow",
    color: "#10B981",
  },
  {
    type: NodeType.MESSAGE,
    icon: ChatBubbleLeftRightIcon,
    label: "Message",
    description: "Send content to users",
    color: "#3B82F6",
  },
  {
    type: NodeType.INPUT,
    icon: PencilIcon,
    label: "Input",
    description: "Collect user responses",
    color: "#F59E0B",
  },
  {
    type: NodeType.CONDITION,
    icon: ArrowPathRoundedSquareIcon,
    label: "Condition",
    description: "Branch based on logic",
    color: "#8B5CF6",
  },
  {
    type: NodeType.DELAY,
    icon: ClockIcon,
    label: "Delay",
    description: "Wait for time period",
    color: "#EF4444",
  },
  {
    type: NodeType.ACTION,
    icon: BoltIcon,
    label: "Action",
    description: "External integrations",
    color: "#06B6D4",
  },
  {
    type: NodeType.END,
    icon: FlagIcon,
    label: "End",
    description: "Complete the flow",
    color: "#6B7280",
  },
];

export const getDefaultConfig = (
  type: NodeType
):
  | BaseTriggerConfig
  | BaseMessageConfig
  | BaseInputConfig
  | BaseConditionConfig
  | BaseDelayConfig
  | BaseActionConfig
  | BaseEndConfig => {
  switch (type) {
    case NodeType.TRIGGER:
      return {
        name: "Trigger",
        event: "manual",
      } as BaseTriggerConfig;

    case NodeType.MESSAGE:
      return {
        name: "Message",
        messageType: "TEXT" as const,
        content: "",
      } as BaseMessageConfig;

    case NodeType.INPUT:
      return {
        name: "Input",
        responseType: "TEXT" as const,
        prompt: "",
        required: true,
        variableName: "",
      } as BaseInputConfig;

    case NodeType.CONDITION:
      return {
        name: "Condition",
        conditions: [],
        defaultCondition: { id: "default", label: "Default" },
      } as BaseConditionConfig;

    case NodeType.DELAY:
      return {
        name: "Delay",
        delayType: "FIXED" as const,
        delayMs: 1000,
      } as BaseDelayConfig;

    case NodeType.ACTION:
      return {
        name: "Action",
        actionType: "HTTP_REQUEST" as const,
        url: "",
        method: "POST",
      } as BaseActionConfig;

    case NodeType.END:
      return {
        name: "End",
        message: "",
        returnData: {},
      } as BaseEndConfig;

    default:
      throw new Error(`Unknown node type: ${type}`);
  }
};
