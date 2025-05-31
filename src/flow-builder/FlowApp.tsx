"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactFlowProvider } from "reactflow";
import FlowBuilder from "./FlowBuilder";
import FlowList from "./components/FlowList/FlowList";
import NewFlowDialog from "./components/FlowList/NewFlowDialog";
import SessionList from "./components/Sessions/SessionList";
import SessionDetail from "./components/Sessions/SessionDetail";
import SessionChatView from "./components/Sessions/SessionChatView";

type AppView =
  | "list"
  | "builder"
  | "sessions"
  | "session-detail"
  | "session-chat-detail";

interface FlowAppState {
  currentView: AppView;
  currentFlowId: string | null;
  currentSessionId: string | null;
  sessionsFlowId: string | null;
  isNewFlowDialogOpen: boolean;
}

const FlowApp: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [state, setState] = useState<FlowAppState>({
    currentView: "list",
    currentFlowId: null,
    currentSessionId: null,
    sessionsFlowId: null,
    isNewFlowDialogOpen: false,
  });

  // Initialize state from URL params on mount
  useEffect(() => {
    const view = searchParams.get("view") as AppView;
    const flowId = searchParams.get("flowId");
    const sessionId = searchParams.get("sessionId");
    const sessionsFlowId = searchParams.get("sessionsFlowId");

    if (view || flowId || sessionId || sessionsFlowId) {
      setState((prev) => ({
        currentView: view || "list",
        currentFlowId: flowId ?? prev.currentFlowId,
        currentSessionId: sessionId ?? prev.currentSessionId,
        sessionsFlowId: sessionsFlowId ?? prev.sessionsFlowId,
        isNewFlowDialogOpen: false,
      }));
    }
  }, [searchParams]);

  // Update URL when state changes
  const updateUrl = (newState: Partial<FlowAppState>) => {
    const params = new URLSearchParams();

    if (newState.currentView && newState.currentView !== "list") {
      params.set("view", newState.currentView);
    }
    if (newState.currentFlowId) {
      params.set("flowId", newState.currentFlowId);
    }
    if (newState.currentSessionId) {
      params.set("sessionId", newState.currentSessionId);
    }
    if (newState.sessionsFlowId) {
      params.set("sessionsFlowId", newState.sessionsFlowId);
    }

    const url = params.toString() ? `?${params.toString()}` : "";
    router.replace(url);
  };

  // Navigation handlers
  const handleShowFlowList = () => {
    const newState = {
      currentView: "list" as AppView,
      currentFlowId: null,
      currentSessionId: null,
      sessionsFlowId: null,
    };
    setState((prev) => ({ ...prev, ...newState }));
    updateUrl(newState);
  };

  const handleCreateNewFlow = () => {
    setState((prev) => ({
      ...prev,
      isNewFlowDialogOpen: true,
    }));
  };

  const handleCloseNewFlowDialog = () => {
    setState((prev) => ({
      ...prev,
      isNewFlowDialogOpen: false,
    }));
  };

  const handleFlowCreated = (flowId: string) => {
    const newState = {
      currentView: "builder" as AppView,
      currentFlowId: flowId,
      isNewFlowDialogOpen: false,
    };
    setState((prev) => ({ ...prev, ...newState }));
    updateUrl(newState);
  };

  const handleEditFlow = (flowId: string) => {
    const newState = {
      currentView: "builder" as AppView,
      currentFlowId: flowId,
    };
    setState((prev) => ({ ...prev, ...newState }));
    updateUrl(newState);
  };

  const handleViewFlow = (flowId: string) => {
    const newState = {
      currentView: "builder" as AppView,
      currentFlowId: flowId,
    };
    setState((prev) => ({ ...prev, ...newState }));
    updateUrl(newState);
  };

  const handleViewSessions = (flowId?: string) => {
    const newState = {
      currentView: "sessions" as AppView,
      sessionsFlowId: flowId || null,
      currentSessionId: null,
    };
    setState((prev) => ({ ...prev, ...newState }));
    updateUrl(newState);
  };

  const handleViewSessionDetail = (
    sessionId: string,
    detail: "session-detail" | "session-chat-detail"
  ) => {
    const newState = {
      currentView: detail as AppView,
      currentSessionId: sessionId,
    };
    setState((prev) => ({ ...prev, ...newState }));
    updateUrl(newState);
  };

  const handleBackToSessions = () => {
    const newState = {
      currentView: "sessions" as AppView,
      currentSessionId: null,
    };
    setState((prev) => ({ ...prev, ...newState }));
    updateUrl(newState);
  };

  // Render current view
  const renderCurrentView = () => {
    switch (state.currentView) {
      case "list":
        return (
          <FlowList
            onCreateNew={handleCreateNewFlow}
            onEditFlow={handleEditFlow}
            onViewFlow={handleViewFlow}
            onViewSessions={handleViewSessions}
          />
        );

      case "builder":
        return (
          <ReactFlowProvider>
            <FlowBuilder
              flowId={state.currentFlowId}
              onBackToList={handleShowFlowList}
            />
          </ReactFlowProvider>
        );

      case "sessions":
        return (
          <SessionList
            flowId={state.sessionsFlowId || ""}
            onBack={handleShowFlowList}
            onViewSession={handleViewSessionDetail}
          />
        );

      case "session-chat-detail":
        return (
          <SessionChatView
            flowId={state.currentFlowId!}
            sessionId={state.currentSessionId!}
            onBack={handleBackToSessions}
          />
        );

      case "session-detail":
        return (
          <SessionDetail
            flowId={state.currentFlowId!}
            sessionId={state.currentSessionId!}
            onBack={handleBackToSessions}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {renderCurrentView()}

      {/* New Flow Dialog */}
      <NewFlowDialog
        isOpen={state.isNewFlowDialogOpen}
        onClose={handleCloseNewFlowDialog}
        onFlowCreated={handleFlowCreated}
      />
    </div>
  );
};

export default FlowApp;
