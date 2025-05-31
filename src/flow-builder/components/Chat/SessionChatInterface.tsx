import React, { useState, useRef, useEffect } from "react";
import { ArrowPathIcon, PlayIcon, EyeIcon } from "@heroicons/react/24/outline";
import { Edge, Node } from "reactflow";

import {
  BaseActionConfig,
  BaseConditionConfig,
  BaseDelayConfig,
  BaseEndConfig,
  BaseInputConfig,
  BaseMessageConfig,
  ChatMessage,
  MessageType,
  NodeType,
  ResponseType,
} from "@/flow-builder/types/flow.types";
import MessageBubble from "./MessageBubble";
import VariableInspector from "./VariableInspector";

interface SessionChatInterfaceProps {
  flowId: string;
  nodes: Node[];
  edges: Edge[];
  sessionData: {
    currentNodeId: string;
    status: "RUNNING" | "PAUSED" | "COMPLETED" | "ERROR";
    variables: Record<string, any>;
    userId: string;
  };
}

const SessionChatInterface: React.FC<SessionChatInterfaceProps> = ({
  flowId,
  nodes,
  edges,
  sessionData,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(
    sessionData.currentNodeId
  );
  const [currentVariables, setCurrentVariables] = useState<Record<string, any>>(
    sessionData.variables
  );
  const [showVariables, setShowVariables] = useState<boolean>(false);
  const [isReplaying, setIsReplaying] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update when session data changes
  useEffect(() => {
    setCurrentNodeId(sessionData.currentNodeId);
    setCurrentVariables(sessionData.variables);
  }, [sessionData]);

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

  const interpolateVariables = (
    text: string,
    variables: Record<string, any>
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

  const replaySession = (): void => {
    setMessages([]);
    setIsReplaying(true);

    // Find trigger node
    const triggerNode = nodes.find(
      (node) => node.data.type === NodeType.TRIGGER
    );
    if (!triggerNode) {
      addSystemMessage("Error: No trigger node found in flow");
      setIsReplaying(false);
      return;
    }

    addSystemMessage(`Replaying session for user: ${sessionData.userId}`);
    addSystemMessage(`Session status: ${sessionData.status}`);

    // Replay the flow up to the current node
    setTimeout(() => replayFlowExecution(triggerNode.id), 500);
  };

  const replayFlowExecution = (
    nodeId: string,
    visitedNodes: Set<string> = new Set()
  ): void => {
    // Prevent infinite loops
    if (visitedNodes.has(nodeId)) {
      addSystemMessage("Detected loop in flow execution");
      setIsReplaying(false);
      return;
    }
    visitedNodes.add(nodeId);

    const node = nodes.find((n) => n.id === nodeId);
    if (!node) {
      addSystemMessage(`Error: Node ${nodeId} not found`);
      setIsReplaying(false);
      return;
    }

    const config = node.data.config;
    const isCurrentNode = nodeId === sessionData.currentNodeId;

    setTimeout(() => {
      switch (node.data.type) {
        case NodeType.TRIGGER:
          const triggerConfig = config as any;
          addSystemMessage(
            `Flow triggered by: ${triggerConfig.event || "manual"}`
          );
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
          break;

        case NodeType.INPUT:
          const inputConfig = config as BaseInputConfig;
          const prompt = interpolateVariables(
            inputConfig.prompt || "Please respond:",
            currentVariables
          );
          addBotMessage(prompt, nodeId, MessageType.TEXT);

          // Show the user's response if we have it in variables
          if (
            inputConfig.variableName &&
            currentVariables[inputConfig.variableName]
          ) {
            setTimeout(() => {
              addUserMessage(
                String(currentVariables[inputConfig.variableName]),
                inputConfig.responseType || ResponseType.TEXT
              );
            }, 500);
          }
          break;

        case NodeType.DELAY:
          const delayConfig = config as BaseDelayConfig;
          const delayMs =
            delayConfig.delayType === "FIXED"
              ? delayConfig.delayMs || 1000
              : currentVariables[delayConfig.delayVariable || "wait_time"] ||
                1000;
          addSystemMessage(`Delayed for ${delayMs}ms`);
          break;

        case NodeType.CONDITION:
          const conditionConfig = config as BaseConditionConfig;
          addSystemMessage("Condition evaluated");
          break;

        case NodeType.ACTION:
          const actionConfig = config as BaseActionConfig;
          addSystemMessage(
            `Executed ${actionConfig.actionType || "HTTP_REQUEST"} action`
          );
          break;

        case NodeType.END:
          const endConfig = config as BaseEndConfig;
          const endMessage = interpolateVariables(
            endConfig.message || "Flow completed!",
            currentVariables
          );
          addBotMessage(endMessage, nodeId, MessageType.TEXT);
          addSystemMessage("Flow ended");
          setIsReplaying(false);
          return;

        default:
          addSystemMessage(`Unknown node type: ${node.data.type}`);
      }

      // If this is the current node, stop here
      if (isCurrentNode) {
        addSystemMessage(`Currently at this node (${sessionData.status})`);
        setIsReplaying(false);
        return;
      }

      // Continue to next node
      const outgoingEdges = edges.filter((edge) => edge.source === nodeId);
      if (outgoingEdges.length > 0) {
        const nextEdge = outgoingEdges[0]; // Take first edge for simplicity
        setTimeout(
          () => replayFlowExecution(nextEdge.target, visitedNodes),
          1000
        );
      } else {
        addSystemMessage("No outgoing connections found");
        setIsReplaying(false);
      }
    }, 800);
  };

  const resetReplay = (): void => {
    setMessages([]);
    setIsReplaying(false);
  };

  return (
    <div className="bg-white rounded-lg w-full h-[700px] flex flex-col shadow-lg border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-gray-800">Session Replay</h3>
          {currentNodeId && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              Current:{" "}
              {nodes.find((n) => n.id === currentNodeId)?.data.config?.name ||
                currentNodeId.slice(0, 8)}
            </span>
          )}
          <span
            className={`text-xs px-2 py-1 rounded ${
              sessionData.status === "RUNNING"
                ? "bg-green-100 text-green-700"
                : sessionData.status === "COMPLETED"
                ? "bg-blue-100 text-blue-700"
                : sessionData.status === "ERROR"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {sessionData.status}
          </span>
          {isReplaying && (
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded flex items-center gap-1">
              <ArrowPathIcon className="w-3 h-3 animate-spin" />
              Replaying
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
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 && !isReplaying && (
              <div className="text-center text-gray-500 text-sm py-8">
                <div className="mb-4">
                  <EyeIcon className="w-16 h-16 mx-auto text-gray-300" />
                </div>
                <p className="mb-2 font-medium">Session Replay</p>
                <p className="text-xs mb-4">
                  Click "Replay Session" to see how this session executed
                </p>
                <div className="text-xs text-gray-400 space-y-1">
                  <p>🎬 This will replay the session flow step by step</p>
                  <p>💬 See all messages and user interactions</p>
                  <p>⚙️ Check variables to see collected data</p>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}

            {isReplaying && (
              <div className="flex justify-start mb-4">
                <div className="bg-white px-3 py-2 rounded-lg shadow flex items-center gap-2 border">
                  <ArrowPathIcon className="w-4 h-4 animate-spin text-purple-500" />
                  <span className="text-sm text-gray-600">Replaying...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Control Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <button
                onClick={replaySession}
                disabled={isReplaying || nodes.length === 0}
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <PlayIcon className="w-4 h-4" />
                Replay Session
              </button>
              <button
                onClick={resetReplay}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
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
          <span>User: {sessionData.userId}</span>
          <span>Nodes: {nodes.length}</span>
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
  );
};

export default SessionChatInterface;
