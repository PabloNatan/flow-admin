"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PlayIcon,
  PauseIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { flowApi, ApiError } from "../../services";
import { FlowListResponse } from "../../types/flow.types";

interface FlowListProps {
  onCreateNew: () => void;
  onEditFlow: (flowId: string) => void;
  onViewFlow: (flowId: string) => void;
  onViewSessions?: (flowId?: string) => void;
}

interface FlowSummary {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  nodeCount: number;
  sessionCount: number;
}

const FlowList: React.FC<FlowListProps> = ({
  onCreateNew,
  onEditFlow,
  onViewFlow,
  onViewSessions,
}) => {
  const [flows, setFlows] = useState<FlowSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalFlows, setTotalFlows] = useState(0);
  const [itemsPerPage] = useState(10);

  // Filter state
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Load flows
  const loadFlows = async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      let response: FlowListResponse;

      switch (filter) {
        case "active":
          response = await flowApi.getActiveFlows();
          break;
        case "inactive":
          response = await flowApi.getInactiveFlows();
          break;
        default:
          response = await flowApi.listFlows({ page, limit: itemsPerPage });
      }

      setFlows(response.data);
      setTotalPages(response.totalPages);
      setTotalFlows(response.currentPage);
      setCurrentPage(response.totalCountOfRegisters);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to load flows: ${err.message}`);
      } else {
        setError(
          "Failed to load flows. Please check your connection and try again."
        );
      }
      console.error("Error loading flows:", err);
    } finally {
      setLoading(false);
    }
  };

  // Delete flow
  const handleDeleteFlow = async (flowId: string, flowName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${flowName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await flowApi.deleteFlow(flowId);
      await loadFlows(currentPage);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to delete flow: ${err.message}`);
      } else {
        alert("Failed to delete flow. Please try again.");
      }
      console.error("Error deleting flow:", err);
    }
  };

  // Duplicate flow
  const handleDuplicateFlow = async (flowId: string) => {
    try {
      await flowApi.duplicateFlow(flowId);
      await loadFlows(currentPage);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(`Failed to duplicate flow: ${err.message}`);
      } else {
        alert("Failed to duplicate flow. Please try again.");
      }
      console.error("Error duplicating flow:", err);
    }
  };

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

  // Filter flows by search term
  const filteredFlows = flows.filter(
    (flow) =>
      flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (flow.description &&
        flow.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Load flows on component mount and filter change
  useEffect(() => {
    loadFlows(1);
  }, [filter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadFlows(page);
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
                  <div key={i} className="h-20 bg-gray-200 rounded"></div>
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
                Error Loading Flows
              </h2>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={() => loadFlows(currentPage)}
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flow Builder</h1>
              <p className="text-gray-600 mt-1">
                Create and manage your automated flows
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onCreateNew}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="w-4 h-4" />
                Create New Flow
              </button>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === "all"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({totalFlows})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === "active"
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilter("inactive")}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === "inactive"
                    ? "bg-gray-100 text-gray-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Inactive
              </button>
            </div>

            <div className="flex-1 sm:max-w-md">
              <input
                type="text"
                placeholder="Search flows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Flow List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredFlows.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {searchTerm ? "No flows found" : "No flows yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms or filters."
                  : "Get started by creating your first automated flow."}
              </p>
              {!searchTerm && (
                <button
                  onClick={onCreateNew}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                >
                  <PlusIcon className="w-5 h-5" />
                  Create Your First Flow
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-hidden">
                {filteredFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className="border-b border-gray-200 last:border-b-0 p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {flow.name}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              flow.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {flow.isActive ? (
                              <>
                                <PlayIcon className="w-3 h-3 mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <PauseIcon className="w-3 h-3 mr-1" />
                                Inactive
                              </>
                            )}
                          </span>
                        </div>

                        {flow.description && (
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {flow.description}
                          </p>
                        )}

                        <div className="flex items-center gap-6 text-xs text-gray-500">
                          <span>{flow.nodeCount} nodes</span>
                          <span>{flow.sessionCount} sessions</span>
                          <span>Updated {formatDate(flow.updatedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => onViewFlow(flow.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          title="View flow"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onEditFlow(flow.id)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit flow"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>

                        {onViewSessions && (
                          <button
                            onClick={() => onViewSessions(flow.id)}
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                            title="View flow sessions"
                          >
                            <ClipboardDocumentListIcon className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => handleDuplicateFlow(flow.id)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Duplicate flow"
                        >
                          <DocumentDuplicateIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDeleteFlow(flow.id, flow.name)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                          title="Delete flow"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Showing page {currentPage} of {totalPages} ({totalFlows}{" "}
                      total flows)
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeftIcon className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const page = i + 1;
                          return (
                            <button
                              key={page}
                              onClick={() => handlePageChange(page)}
                              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                page === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-600 hover:bg-gray-100"
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRightIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlowList;
