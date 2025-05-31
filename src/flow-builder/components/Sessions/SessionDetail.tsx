"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  PauseIcon,
  ClockIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/outline";
import { flowApi } from "../../services";

interface SessionDetailProps {
  flowId: string;
  sessionId: string;
  onBack: () => void;
  onViewChat?: () => void;
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

const SessionDetail: React.FC<SessionDetailProps> = ({
  sessionId,
  flowId,
  onBack,
  onViewChat,
}) => {
  const [sessionData, setSessionData] = useState<FlowSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load session details from the API
  const loadSessionDetail = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await flowApi.getFlowSession(sessionId);
      setSessionData(data);
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

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RUNNING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            <PlayIcon className="w-4 h-4 mr-1" />
            Running
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            <PauseIcon className="w-4 h-4 mr-1" />
            Paused
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            <StopIcon className="w-4 h-4 mr-1" />
            Completed
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
            <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  // Get node type color
  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case "TRIGGER":
        return "bg-green-100 text-green-800";
      case "MESSAGE":
        return "bg-blue-100 text-blue-800";
      case "INPUT":
        return "bg-yellow-100 text-yellow-800";
      case "ACTION":
        return "bg-purple-100 text-purple-800";
      case "CONDITION":
        return "bg-orange-100 text-orange-800";
      case "DELAY":
        return "bg-gray-100 text-gray-800";
      case "END":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
    <div className=" bg-gray-50 p-6 overflow-y-scroll h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Back to sessions"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  Session Details
                </h1>
                {getStatusBadge(sessionData.session.status)}
              </div>
              <p className="text-gray-600">
                Flow: {sessionData.name} • Session ID: {sessionData.session.id}
              </p>
            </div>
            {onViewChat && (
              <button
                onClick={onViewChat}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                Chat View
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Session Information */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Session Info
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <UserIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono text-gray-900">
                    {sessionData.session.userId}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Started:</span>
                  <span className="text-gray-900">
                    {formatDate(sessionData.session.startedAt)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <ClockIcon className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Last Active:</span>
                  <span className="text-gray-900">
                    {formatDate(sessionData.session.lastActiveAt)}
                  </span>
                </div>
                {sessionData.session.completedAt && (
                  <div className="flex items-center gap-2 text-sm">
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">Completed:</span>
                    <span className="text-gray-900">
                      {formatDate(sessionData.session.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Variables */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Variables
              </h2>
              {Object.keys(sessionData.session.variables).length === 0 ? (
                <p className="text-gray-500 text-sm">No variables set</p>
              ) : (
                <div className="space-y-2">
                  {Object.entries(sessionData.session.variables).map(
                    ([key, value]) => (
                      <div key={key} className="bg-gray-50 rounded p-3">
                        <div className="text-sm font-medium text-gray-700">
                          {key}
                        </div>
                        <div className="text-sm text-gray-900 font-mono break-all">
                          {typeof value === "string"
                            ? value
                            : JSON.stringify(value)}
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Flow Nodes */}
          <div className="lg:col-span-2">
            <div className="bg-white overflow-y-auto rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Flow Nodes
              </h2>
              <div className="space-y-4">
                {sessionData.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`border rounded-lg p-4 ${
                      node.id === sessionData.session.currentNodeId
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getNodeTypeColor(
                            node.type
                          )}`}
                        >
                          {node.type}
                        </span>
                        {node.id === sessionData.session.currentNodeId && (
                          <span className="text-blue-600 text-xs font-medium">
                            Current Node
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        {node.id}
                      </span>
                    </div>

                    {/* Node Configuration */}
                    <div className="bg-gray-50 rounded p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Configuration
                      </h4>
                      <pre className="text-xs text-gray-600 overflow-x-auto">
                        {JSON.stringify(node.config, null, 2)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionDetail;
