import React, { useState } from "react";
import { Node } from "reactflow";
import {
  CheckCircleIcon,
  DocumentTextIcon,
  CodeBracketIcon,
  ClipboardDocumentIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

import { BaseEndConfig } from "@/flow-builder/types/flow.types";
import { Textarea } from "../core";

interface ReturnDataTemplate {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  data: object;
}

interface EndFormProps {
  selectedNode: Node;
  updateConfig: (field: string, value: any) => void;
}

const EndForm: React.FC<EndFormProps> = ({ selectedNode, updateConfig }) => {
  const [jsonError, setJsonError] = useState<string>("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const config = selectedNode.data.config as BaseEndConfig;

  const returnDataTemplates: ReturnDataTemplate[] = [
    {
      name: "Basic Success",
      description: "Simple completion confirmation",
      icon: CheckCircleIcon,
      data: {
        success: true,
        completedAt: "{{current_timestamp}}",
        sessionId: "{{session_id}}",
      },
    },
    {
      name: "Detailed Results",
      description: "Include all user responses and flow data",
      icon: DocumentTextIcon,
      data: {
        success: true,
        completedAt: "{{current_timestamp}}",
        userResponses: "{{all_responses}}",
        flowId: "{{flow_id}}",
        sessionId: "{{session_id}}",
        variables: "{{all_variables}}",
      },
    },
    {
      name: "Summary Report",
      description: "Flow completion statistics and metrics",
      icon: ClipboardDocumentIcon,
      data: {
        success: true,
        completedAt: "{{current_timestamp}}",
        summary: {
          totalSteps: "{{total_steps}}",
          timeSpent: "{{time_spent}}",
          responses: "{{response_count}}",
          flowVersion: "{{flow_version}}",
        },
        metadata: {
          userAgent: "{{user_agent}}",
          ipAddress: "{{ip_address}}",
          referrer: "{{referrer}}",
        },
      },
    },
    {
      name: "Lead Capture",
      description: "Structured data for lead generation flows",
      icon: SparklesIcon,
      data: {
        success: true,
        leadData: {
          name: "{{user_name}}",
          email: "{{user_email}}",
          phone: "{{user_phone}}",
          company: "{{user_company}}",
          interest: "{{user_interest}}",
          source: "{{traffic_source}}",
        },
        score: "{{lead_score}}",
        nextAction: "{{recommended_action}}",
        timestamp: "{{current_timestamp}}",
      },
    },
    {
      name: "Error Response",
      description: "Structure for handling flow errors",
      icon: DocumentTextIcon,
      data: {
        success: false,
        error: {
          code: "{{error_code}}",
          message: "{{error_message}}",
          details: "{{error_details}}",
        },
        partialData: "{{collected_responses}}",
        recoveryAction: "{{recovery_suggestion}}",
        timestamp: "{{current_timestamp}}",
      },
    },
  ];

  const updateReturnData = (dataString: string) => {
    try {
      if (dataString.trim()) {
        const parsedData = JSON.parse(dataString);
        updateConfig("returnData", parsedData);
        setJsonError("");
      } else {
        updateConfig("returnData", {});
        setJsonError("");
      }
    } catch (error) {
      setJsonError("Invalid JSON format");
      // Still update to allow user to continue typing
      updateConfig("returnData", dataString);
    }
  };

  const getReturnDataString = (): string => {
    const returnData = config?.returnData;
    if (typeof returnData === "string") return returnData;
    if (typeof returnData === "object" && returnData !== null) {
      return JSON.stringify(returnData, null, 2);
    }
    return "";
  };

  const applyTemplate = (template: ReturnDataTemplate) => {
    updateConfig("returnData", template.data);
    setShowTemplates(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      // Could add a toast notification here
    });
  };

  const commonVariables = [
    { name: "current_timestamp", description: "Current date and time" },
    { name: "session_id", description: "Current session identifier" },
    { name: "flow_id", description: "Flow identifier" },
    { name: "user_id", description: "User identifier" },
    { name: "all_responses", description: "All user responses in the flow" },
    { name: "all_variables", description: "All flow variables" },
    { name: "total_steps", description: "Number of nodes executed" },
    { name: "time_spent", description: "Total time in flow (seconds)" },
    { name: "response_count", description: "Number of user responses" },
  ];

  return (
    <>
      <div>
        <Textarea
          label="Completion Message"
          value={config?.message || ""}
          onChange={(value) => updateConfig("message", value)}
          rows={3}
          placeholder="Thank you for completing the flow!"
        />
        <div className="text-xs text-gray-500 mt-1">
          This message will be shown to users when the flow completes. Use{" "}
          {`variable_name`} for dynamic content.
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-700">
            Return Data (JSON)
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTemplates(!showTemplates)}
              className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <SparklesIcon className="w-3 h-3" />
              Templates
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs text-gray-600 hover:text-gray-700 flex items-center gap-1"
            >
              {showPreview ? (
                <EyeSlashIcon className="w-3 h-3" />
              ) : (
                <EyeIcon className="w-3 h-3" />
              )}
              Preview
            </button>
          </div>
        </div>

        {showTemplates && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
            <h5 className="text-sm font-medium text-gray-700 mb-2">
              Quick Templates:
            </h5>
            <div className="space-y-2">
              {returnDataTemplates.map((template, index) => {
                const IconComponent = template.icon;
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => applyTemplate(template)}
                    className="w-full text-left p-2 border border-gray-200 rounded hover:bg-white hover:border-gray-300 transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <IconComponent className="w-4 h-4 text-gray-600" />
                      <span className="font-medium text-sm text-gray-800">
                        {template.name}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {template.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Textarea
          value={getReturnDataString()}
          onChange={(value) => updateReturnData(value)}
          rows={8}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-mono text-sm ${
            jsonError
              ? "border-red-300 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
          }`}
          placeholder='{"success": true, "completedAt": "{{current_timestamp}}", "userResponses": "{{all_responses}}"}'
        />

        {jsonError && (
          <div className="text-xs text-red-600 mt-1">{jsonError}</div>
        )}

        <div className="text-xs text-gray-500 mt-1">
          Data to return when the flow completes. Use {`variable_name`} for
          dynamic values.
        </div>

        {showPreview && config?.returnData && !jsonError && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <h5 className="text-xs font-medium text-blue-700">
                JSON Preview:
              </h5>
              <button
                type="button"
                onClick={() => copyToClipboard(getReturnDataString())}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                Copy
              </button>
            </div>
            <pre className="text-xs text-blue-800 overflow-auto max-h-32">
              {JSON.stringify(config.returnData, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Available Variables Reference */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center gap-2 mb-2">
          <CodeBracketIcon className="w-4 h-4 text-gray-500" />
          <h5 className="text-sm font-medium text-gray-700">
            Available Variables
          </h5>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto">
          <div className="grid grid-cols-1 gap-2">
            {commonVariables.map((variable, index) => (
              <div
                key={index}
                className="flex items-start justify-between gap-2 text-xs cursor-pointer hover:bg-gray-100 p-1 rounded"
                onClick={() => copyToClipboard(`{{${variable.name}}}`)}
                title="Click to copy"
              >
                <span className="font-mono text-blue-600">{`${variable.name}`}</span>
                <span className="text-gray-600 text-right">
                  {variable.description}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Click any variable to copy it. Variables are replaced with actual
          values when the flow executes.
        </div>
      </div>

      {/* Flow Completion Preview */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <h5 className="text-xs font-medium text-gray-700 mb-2">
          🏁 End Node Preview:
        </h5>
        <div className="space-y-2">
          {config?.message && (
            <div>
              <span className="text-xs font-medium text-gray-600">
                Completion Message:{" "}
              </span>
              <span className="text-xs text-gray-700">{config.message}</span>
            </div>
          )}

          {config?.returnData && Object.keys(config.returnData).length > 0 && (
            <div>
              <span className="text-xs font-medium text-gray-600">
                Return Data:{" "}
              </span>
              <span className="text-xs text-gray-700">
                {Object.keys(config.returnData).length} properties defined
              </span>
            </div>
          )}

          {!config?.message &&
            (!config?.returnData ||
              Object.keys(config.returnData).length === 0) && (
              <div className="text-xs text-gray-500 italic">
                No completion message or return data configured
              </div>
            )}
        </div>
      </div>

      {/* Usage Guidelines */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 font-medium mb-1">
          ℹ️ About End Nodes:
        </p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• End nodes mark the completion of a flow path</li>
          <li>• Users cannot proceed beyond an end node</li>
          <li>• Multiple end nodes can exist for different outcomes</li>
          <li>• Return data is sent back to the calling system/API</li>
          <li>• Use variables to include dynamic data in responses</li>
        </ul>
      </div>

      {/* Best Practices */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800 font-medium mb-1">
          💡 Best Practices:
        </p>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Always include a success indicator in return data</li>
          <li>• Provide meaningful completion messages for users</li>
          <li>• Include timestamps for audit trails</li>
          <li>• Consider including collected user data for CRM integration</li>
          <li>• Use consistent data structure across different end points</li>
        </ul>
      </div>
    </>
  );
};

export default EndForm;
