import React, { useState, useRef, useEffect } from "react";
import {
  XMarkIcon,
  ArrowPathIcon,
  PlayIcon,
  StopIcon,
} from "@heroicons/react/24/outline";
import { Edge, Node } from "reactflow";

import {
  BaseActionConfig,
  BaseConditionConfig,
  BaseDelayConfig,
  BaseEndConfig,
  BaseInputConfig,
  BaseMessageConfig,
  ChatMessage,
  Condition,
  ConditionOperator,
  MessageType,
  NodeType,
  ResponseType,
} from "@/flow-builder/types/flow.types";
import MessageBubble from "./MessageBubble";
import InputWidget from "./InputWidget";
import VariableInspector from "./VariableInspector";

interface ChatInterfaceProps {
  isOpen: boolean;
  onClose: () => void;
  flowId: string;
  nodes: Node[];
  edges: Edge[];
}

interface SessionVariables {
  [key: string]: any;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  session_id: string;
  current_timestamp: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  isOpen,
  onClose,
  flowId,
  nodes,
  edges,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const [currentInputType, setCurrentInputType] = useState<ResponseType>(
    ResponseType.TEXT
  );
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentVariables, setCurrentVariables] = useState<SessionVariables>({
    user: {
      name: "John Doe",
      email: "john@example.com",
      phone: "+1234567890",
    },
    session_id: `session-${Date.now()}`,
    current_timestamp: new Date().toISOString(),
  });
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [showVariables, setShowVariables] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const resetChat = (): void => {
    setMessages([]);
    setInputValue("");
    setIsWaitingForInput(false);
    setIsRunning(false);
    setCurrentVariables({
      user: {
        name: "John Doe",
        email: "john@example.com",
        phone: "+1234567890",
      },
      session_id: `session-${Date.now()}`,
      current_timestamp: new Date().toISOString(),
    });
    setCurrentNodeId(null);
  };

  const startFlow = (): void => {
    resetChat();
    setIsRunning(true);

    // Find trigger node
    const triggerNode = nodes.find(
      (node) => node.data.type === NodeType.TRIGGER
    );
    if (!triggerNode) {
      addSystemMessage("Error: No trigger node found in flow");
      setIsRunning(false);
      return;
    }

    addSystemMessage("Flow started...");
    setTimeout(() => executeNode(triggerNode.id), 500);
  };

  const stopFlow = (): void => {
    setIsRunning(false);
    setIsWaitingForInput(false);
    addSystemMessage("Flow stopped by user");
  };

  const addSystemMessage = (content: string): void => {
    const message: ChatMessage = {
      id: Date.now(),
      type: "system",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addBotMessage = (
    content: string,
    nodeId: string,
    messageType: MessageType = MessageType.TEXT
  ): void => {
    const message: ChatMessage = {
      id: Date.now(),
      type: "bot",
      content,
      messageType,
      nodeId,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const addUserMessage = (
    content: string,
    responseType: ResponseType = ResponseType.TEXT
  ): void => {
    const message: ChatMessage = {
      id: Date.now(),
      type: "user",
      content,
      responseType,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, message]);
  };

  const executeNode = (nodeId: string): void => {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      addSystemMessage(`Error: Node ${nodeId} not found`);
      setIsRunning(false);
      return;
    }

    setCurrentNodeId(nodeId);
    const config = node.data.config;

    switch (node.data.type) {
      case NodeType.TRIGGER:
        const triggerConfig = config as any;
        addSystemMessage(`Triggered by: ${triggerConfig.event || "manual"}`);
        setTimeout(() => executeNextNode(nodeId), 500);
        break;

      case NodeType.MESSAGE:
        const messageConfig = config as BaseMessageConfig;
        const content = interpolateVariables(
          typeof messageConfig.content === "string"
            ? messageConfig.content
            : "Empty message",
          currentVariables
        );
        addBotMessage(content, nodeId, messageConfig.messageType);
        setTimeout(() => executeNextNode(nodeId), 1000);
        break;

      case NodeType.INPUT:
        const inputConfig = config as BaseInputConfig;
        const prompt = interpolateVariables(
          inputConfig.prompt || "Please respond:",
          currentVariables
        );
        addBotMessage(prompt, nodeId, MessageType.TEXT);
        setIsWaitingForInput(true);
        setCurrentInputType(inputConfig.responseType || ResponseType.TEXT);
        break;

      case NodeType.DELAY:
        const delayConfig = config as BaseDelayConfig;
        const delayMs =
          delayConfig.delayType === "FIXED"
            ? delayConfig.delayMs || 1000
            : currentVariables[delayConfig.delayVariable || "wait_time"] ||
              1000;

        addSystemMessage(`Waiting ${delayMs}ms...`);
        setTimeout(() => executeNextNode(nodeId), delayMs);
        break;

      case NodeType.CONDITION:
        const conditionConfig = config as BaseConditionConfig;
        const conditionResult = evaluateConditions(
          conditionConfig.conditions || [],
          currentVariables
        );
        addSystemMessage(
          `Condition evaluated: ${conditionResult || "default"}`
        );
        setTimeout(() => executeNextNode(nodeId, conditionResult), 500);
        break;

      case NodeType.ACTION:
        const actionConfig = config as BaseActionConfig;
        addSystemMessage(
          `Executing ${actionConfig.actionType || "HTTP_REQUEST"} action...`
        );
        // Simulate action execution
        setTimeout(() => {
          addSystemMessage("Action completed successfully");
          executeNextNode(nodeId);
        }, 1500);
        break;

      case NodeType.END:
        const endConfig = config as BaseEndConfig;
        const endMessage = interpolateVariables(
          endConfig.message || "Flow completed!",
          currentVariables
        );
        addBotMessage(endMessage, nodeId, MessageType.TEXT);
        addSystemMessage("Flow ended");
        setIsRunning(false);
        break;

      default:
        addSystemMessage(`Unknown node type: ${node.data.type}`);
        setIsRunning(false);
    }
  };

  const executeNextNode = (
    currentNodeId: string,
    conditionPath?: string | null
  ): void => {
    const outgoingEdges = edges.filter((edge) => edge.source === currentNodeId);

    if (outgoingEdges.length === 0) {
      addSystemMessage("No outgoing connections found");
      setIsRunning(false);
      return;
    }

    let nextEdge: Edge | undefined;
    if (conditionPath) {
      // Find edge for specific condition path
      nextEdge = outgoingEdges.find(
        (edge) => edge.sourceHandle === conditionPath
      );
    }

    if (!nextEdge) {
      nextEdge = outgoingEdges[0]; // Default to first edge
    }

    if (nextEdge) {
      executeNode(nextEdge.target);
    }
  };

  const sendUserResponse = (): void => {
    if (!inputValue.trim() || !isWaitingForInput) return;

    addUserMessage(inputValue, currentInputType);

    // Store response in variables
    const currentNode = nodes.find((n) => n.id === currentNodeId);
    if (currentNode?.data.config) {
      const inputConfig = currentNode.data.config as BaseInputConfig;
      if (inputConfig.variableName) {
        setCurrentVariables((prev) => ({
          ...prev,
          [inputConfig.variableName]: inputValue,
        }));
      }
    }

    setInputValue("");
    setIsWaitingForInput(false);

    setTimeout(() => executeNextNode(currentNodeId!), 500);
  };

  const interpolateVariables = (
    text: string,
    variables: SessionVariables
  ): string => {
    if (!text) return text;

    return text.replace(/\{\{([^}]+)\}\}/g, (match, varPath) => {
      const keys = varPath.trim().split(".");
      let value: any = variables;

      for (const key of keys) {
        value = value?.[key];
        if (value === undefined) break;
      }

      return value !== undefined ? String(value) : match;
    });
  };

  const evaluateConditions = (
    conditions: Condition[],
    variables: SessionVariables
  ): string | null => {
    for (const condition of conditions) {
      const variableValue = getVariableValue(condition.variable, variables);
      const conditionValue = condition.value;

      let result = false;
      switch (condition.operator as ConditionOperator) {
        case "equals":
          result = String(variableValue) === String(conditionValue);
          break;
        case "not_equals":
          result = String(variableValue) !== String(conditionValue);
          break;
        case "greater_than":
          result = Number(variableValue) > Number(conditionValue);
          break;
        case "less_than":
          result = Number(variableValue) < Number(conditionValue);
          break;
        case "contains":
          result = String(variableValue).includes(String(conditionValue));
          break;
        case "starts_with":
          result = String(variableValue).startsWith(String(conditionValue));
          break;
        case "is_empty":
          result = !variableValue || String(variableValue).trim() === "";
          break;
        case "is_not_empty":
          result = variableValue && String(variableValue).trim() !== "";
          break;
        default:
          result = false;
      }

      if (result) {
        return condition.id;
      }
    }
    return null; // Default path
  };

  const getVariableValue = (
    varPath: string,
    variables: SessionVariables
  ): any => {
    const keys = varPath.split(".");
    let value: any = variables;

    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) break;
    }

    return value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[800px] h-[700px] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-800">Flow Testing Chat</h3>
            {currentNodeId && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                Current:{" "}
                {nodes.find((n) => n.id === currentNodeId)?.data.config?.name ||
                  currentNodeId}
              </span>
            )}
            {isRunning && (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded flex items-center gap-1">
                <ArrowPathIcon className="w-3 h-3 animate-spin" />
                Running
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowVariables(!showVariables)}
              className={`px-2 py-1 text-xs border rounded hover:bg-gray-50 transition-colors ${
                showVariables
                  ? "border-blue-500 text-blue-600"
                  : "border-gray-300"
              }`}
            >
              Variables
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 flex">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
              {messages.length === 0 && !isRunning && (
                <div className="text-center text-gray-500 text-sm py-8">
                  <div className="mb-4">
                    <PlayIcon className="w-16 h-16 mx-auto text-gray-300" />
                  </div>
                  <p className="mb-2 font-medium">Ready to test your flow</p>
                  <p className="text-xs mb-4">
                    Click "Start Flow" to begin testing
                  </p>
                  <div className="text-xs text-gray-400 space-y-1">
                    <p>
                      💡 This simulation will execute your flow step by step
                    </p>
                    <p>
                      🔗 Follow the conversation to see how users will
                      experience it
                    </p>
                    <p>
                      ⚙️ Check the Variables panel to see data collection in
                      real-time
                    </p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isRunning && !isWaitingForInput && (
                <div className="flex justify-start mb-4">
                  <div className="bg-white px-3 py-2 rounded-lg shadow flex items-center gap-2 border">
                    <ArrowPathIcon className="w-4 h-4 animate-spin text-blue-500" />
                    <span className="text-sm text-gray-600">Processing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 bg-white">
              {!isRunning ? (
                <div className="flex gap-2">
                  <button
                    onClick={startFlow}
                    disabled={nodes.length === 0}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <PlayIcon className="w-4 h-4" />
                    Start Flow
                  </button>
                  <button
                    onClick={resetChat}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Reset
                  </button>
                </div>
              ) : isWaitingForInput ? (
                <InputWidget
                  inputType={currentInputType}
                  value={inputValue}
                  onChange={setInputValue}
                  onSubmit={sendUserResponse}
                  placeholder={`Enter ${currentInputType
                    .toLowerCase()
                    .replace("_", " ")}...`}
                />
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-500 rounded-md text-center flex items-center justify-center gap-2">
                    <ArrowPathIcon className="w-4 h-4 animate-spin" />
                    Flow is running...
                  </div>
                  <button
                    onClick={stopFlow}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-2 transition-colors"
                  >
                    <StopIcon className="w-4 h-4" />
                    Stop
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Variable Inspector */}
          {showVariables && (
            <VariableInspector
              variables={currentVariables}
              onClose={() => setShowVariables(false)}
            />
          )}
        </div>

        {/* Status Bar */}
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span>Flow: {flowId}</span>
            <span>Nodes: {nodes.length}</span>
            <span>Edges: {edges.length}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Messages: {messages.length}</span>
            <span>Variables: {Object.keys(currentVariables).length}</span>
            {currentNodeId && (
              <span>Current: {currentNodeId.slice(0, 8)}...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
