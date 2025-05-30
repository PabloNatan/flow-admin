import React from "react";
import {
  PlayIcon,
  DocumentCheckIcon,
  EyeIcon,
  ArrowPathIcon,
  ArrowLeftIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface FlowToolbarProps {
  onSave: () => void;
  onTest: () => void;
  onValidate: () => void;
  onBackToList?: () => void;
  isLoading: boolean;
  flowName: string;
  setFlowName: (name: string) => void;
  flowDescription?: string;
  setFlowDescription?: (description: string) => void;
  isDirty?: boolean;
  error?: string | null;
  onExport?: () => void;
  onImport?: () => void;
}

const FlowToolbar: React.FC<FlowToolbarProps> = ({
  onSave,
  onTest,
  onValidate,
  onBackToList,
  isLoading,
  flowName,
  setFlowName,
  flowDescription,
  setFlowDescription,
  isDirty = false,
  error,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm">
      {/* Error Banner */}
      {error && (
        <div className="mb-3 px-4 py-2 bg-red-50 border border-red-200 rounded-md flex items-center gap-2">
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {/* Back Button */}
          {onBackToList && (
            <button
              onClick={onBackToList}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Back to flow list"
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          )}
          
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded transition-colors min-w-0"
                placeholder="Untitled Flow"
              />
              {isDirty && (
                <span className="text-xs text-orange-500 font-medium whitespace-nowrap">
                  • Unsaved changes
                </span>
              )}
            </div>
            
            {/* Description Input */}
            {setFlowDescription !== undefined && (
              <input
                type="text"
                value={flowDescription || ''}
                onChange={(e) => setFlowDescription(e.target.value)}
                className="text-sm text-gray-600 bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded transition-colors min-w-0"
                placeholder="Add a description..."
              />
            )}
          </div>
          
          <span className="text-sm text-gray-500 border-l border-gray-200 pl-4 hidden sm:block">
            Visual Flow Builder
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onValidate}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2 transition-colors"
            disabled={isLoading}
            title="Validate flow structure"
          >
            <EyeIcon className="w-4 h-4" />
            Validate
          </button>

          <button
            onClick={onTest}
            className="px-3 py-2 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={isLoading}
            title="Test flow execution"
          >
            <PlayIcon className="w-4 h-4" />
            Test Flow
          </button>

          <button
            onClick={onSave}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2 transition-colors disabled:opacity-50"
            disabled={isLoading}
            title="Save flow"
          >
            {isLoading ? (
              <ArrowPathIcon className="w-4 h-4 animate-spin" />
            ) : (
              <DocumentCheckIcon className="w-4 h-4" />
            )}
            {isLoading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlowToolbar;