"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { Node, Edge } from "reactflow";
import { flowApi } from "../../services";
import SessionChatInterface from "../Chat/SessionChatInterface";

interface SessionChatViewProps {
  flowId: string;
  sessionId: string;
  onBack: () => void;
}

interface SessionNode {
  id: string;
  flowId: string;
  type:
    | "TRIGGER"
    | "MESSAGE"
    | "INPUT"
    | "ACTION"
    | "CONDITION"
    | "DELAY"
    | "END";
  position: {
    x: number;
    y: number;
  };
  config: any;
  createdAt: string;
  updatedAt: string;
}

interface SessionEdge {
  id: string;
  flowId: string;
  sourceId: string;
  targetId: string;
  condition: any;
  label: string | null;
  createdAt: string;
}

interface SessionData {
  id: string;
  flowId: string;
  userId: string;
  currentNodeId: string;
  status: "RUNNING" | "PAUSED" | "COMPLETED" | "ERROR";
  variables: Record<string, any>;
  startedAt: string;
  completedAt: string | null;
  lastActiveAt: string;
}

interface FlowSession {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  applicationId: string;
  session: SessionData;
  nodes: SessionNode[];
  edges: SessionEdge[];
}

const SessionChatView: React.FC<SessionChatViewProps> = ({
  sessionId,
  flowId,
  onBack,
}) => {
  const [sessionData, setSessionData] = useState<FlowSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reactFlowNodes, setReactFlowNodes] = useState<Node[]>([]);
  const [reactFlowEdges, setReactFlowEdges] = useState<Edge[]>([]);

  // Load session details from the API
  const loadSessionDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await flowApi.getFlowSession(sessionId);
      setSessionData(data);

      // Convert session nodes to ReactFlow format
      const nodes: Node[] = data.nodes.map((node) => ({
        id: node.id,
        type: "customNode",
        position: node.position,
        data: {
          type: node.type,
          config: node.config,
        },
      }));

      // Convert session edges to ReactFlow format
      const edges: Edge[] = data.edges.map((edge) => ({
        id: edge.id,
        source: edge.sourceId,
        target: edge.targetId,
        label: edge.label,
        data: edge.condition,
      }));

      setReactFlowNodes(nodes);
      setReactFlowEdges(edges);
    } catch (err) {
      setError("Failed to load session details. Please try again.");
      console.error("Error loading session details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessionDetail();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
              <div className="space-y-6">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="h-48 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !sessionData) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Session
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadSessionDetail}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 overflow-y-auto">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Back to session detail"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Session Chat View
                </h1>
                <p className="text-sm text-gray-600">
                  Flow: {sessionData.name} • Session: {sessionData.session.id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <SessionChatInterface
            flowId={flowId}
            nodes={reactFlowNodes}
            edges={reactFlowEdges}
            sessionData={{
              currentNodeId: sessionData.session.currentNodeId,
              status: sessionData.session.status,
              variables: sessionData.session.variables,
              userId: sessionData.session.userId,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SessionChatView;
