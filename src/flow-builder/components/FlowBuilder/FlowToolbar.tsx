import React from "react";
import {
  PlayIcon,
  DocumentCheckIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface FlowToolbarProps {
  onSave: () => void;
  onTest: () => void;
  onValidate: () => void;
  isLoading: boolean;
  flowName: string;
  setFlowName: (name: string) => void;
  isDirty?: boolean;
  onExport?: () => void;
  onImport?: () => void;
}

const FlowToolbar: React.FC<FlowToolbarProps> = ({
  onSave,
  onTest,
  onValidate,
  isLoading,
  flowName,
  setFlowName,
  isDirty = false,
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            className="text-lg font-semibold bg-transparent border-none outline-none focus:bg-gray-50 px-2 py-1 rounded transition-colors"
            placeholder="Untitled Flow"
          />
          {isDirty && (
            <span className="text-xs text-orange-500 font-medium">
              • Unsaved changes
            </span>
          )}
        </div>
        <span className="text-sm text-gray-500 border-l border-gray-200 pl-4">
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
  );
};

export default FlowToolbar;
