"use client";

import React, { useState } from 'react';
import { ReactFlowProvider } from 'reactflow';
import FlowBuilder from './FlowBuilder';
import FlowList from './components/FlowList/FlowList';
import NewFlowDialog from './components/FlowList/NewFlowDialog';

type AppView = 'list' | 'builder';

interface FlowAppState {
  currentView: AppView;
  currentFlowId: string | null;
  isNewFlowDialogOpen: boolean;
}

const FlowApp: React.FC = () => {
  const [state, setState] = useState<FlowAppState>({
    currentView: 'list',
    currentFlowId: null,
    isNewFlowDialogOpen: false,
  });

  // Navigation handlers
  const handleShowFlowList = () => {
    setState(prev => ({
      ...prev,
      currentView: 'list',
      currentFlowId: null,
    }));
  };

  const handleCreateNewFlow = () => {
    setState(prev => ({
      ...prev,
      isNewFlowDialogOpen: true,
    }));
  };

  const handleCloseNewFlowDialog = () => {
    setState(prev => ({
      ...prev,
      isNewFlowDialogOpen: false,
    }));
  };

  const handleFlowCreated = (flowId: string) => {
    setState(prev => ({
      ...prev,
      currentView: 'builder',
      currentFlowId: flowId,
      isNewFlowDialogOpen: false,
    }));
  };

  const handleEditFlow = (flowId: string) => {
    setState(prev => ({
      ...prev,
      currentView: 'builder',
      currentFlowId: flowId,
    }));
  };

  const handleViewFlow = (flowId: string) => {
    setState(prev => ({
      ...prev,
      currentView: 'builder',
      currentFlowId: flowId,
    }));
  };

  // Render current view
  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'list':
        return (
          <FlowList
            onCreateNew={handleCreateNewFlow}
            onEditFlow={handleEditFlow}
            onViewFlow={handleViewFlow}
          />
        );
      
      case 'builder':
        return (
          <ReactFlowProvider>
            <FlowBuilder
              flowId={state.currentFlowId}
              onBackToList={handleShowFlowList}
            />
          </ReactFlowProvider>
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