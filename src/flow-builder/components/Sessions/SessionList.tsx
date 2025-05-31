"use client";

import React, { useState, useEffect } from "react";
import {
  ChevronLeftIcon,
  EyeIcon,
  PlayIcon,
  StopIcon,
  ExclamationTriangleIcon,
  PauseIcon,
} from "@heroicons/react/24/outline";
import { flowApi, ApiError } from "../../services";

interface SessionListProps {
  flowId: string;
  onBack: () => void;
  onViewSession: (
    sessionId: string,
    detail: "session-detail" | "session-chat-detail"
  ) => void;
}

interface SessionSummary {
  sessionId: string;
  status: "RUNNING" | "PAUSED" | "COMPLETED" | "ERROR";
  currentNodeId: string;
  waitingForInput: boolean;
  createdAt: string;
  updatedAt: string;
}

const SessionList: React.FC<SessionListProps> = ({
  flowId,
  onBack,
  onViewSession,
}) => {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sessions from the API
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await flowApi.getFlowSessions(flowId);
      setSessions(response.data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to load sessions: ${err.message}`);
      } else {
        setError(
          "Failed to load sessions. Please check your connection and try again."
        );
      }
      console.error("Error loading sessions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RUNNING":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <PlayIcon className="w-3 h-3 mr-1" />
            Running
          </span>
        );
      case "PAUSED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <PauseIcon className="w-3 h-3 mr-1" />
            Paused
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <StopIcon className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      case "ERROR":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Error
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Sessions
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadSessions}
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Back to flows"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Flow Sessions
              </h1>
              <p className="text-gray-600 mt-1">
                View and manage active flow sessions
              </p>
            </div>
          </div>
        </div>

        {/* Sessions List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {sessions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No sessions found
              </h3>
              <p className="text-gray-500">
                Sessions will appear here when flows are executed.
              </p>
            </div>
          ) : (
            <div className="overflow-hidden">
              {sessions.map((session) => (
                <div
                  key={session.sessionId}
                  className="border-b border-gray-200 last:border-b-0 p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate font-mono">
                          {session.sessionId}
                        </h3>
                        {getStatusBadge(session.status)}
                      </div>

                      <div className="flex items-center gap-6 text-xs text-gray-500">
                        <span>Node: {session.currentNodeId}</span>
                        <span>
                          {session.waitingForInput
                            ? "Waiting for input"
                            : "Not waiting"}
                        </span>
                        <span>Created {formatDate(session.createdAt)}</span>
                        <span>Updated {formatDate(session.updatedAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() =>
                          onViewSession(session.sessionId, "session-detail")
                        }
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View session details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() =>
                          onViewSession(
                            session.sessionId,
                            "session-chat-detail"
                          )
                        }
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View session details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionList;
