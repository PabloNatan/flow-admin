import React, { useState } from "react";
import { Node } from "reactflow";
import {
  GlobeAltIcon,
  BoltIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { ActionType, BaseActionConfig } from "@/flow-builder/types/flow.types";
import { TextInput, Select, Textarea, NumberInput } from "../core";

interface ActionTypeOption {
  value: ActionType;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
}

interface ActionFormProps {
  selectedNode: Node;
  updateConfig: (field: string, value: any) => void;
}

const ActionForm: React.FC<ActionFormProps> = ({
  selectedNode,
  updateConfig,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jsonError, setJsonError] = useState<string>("");

  const actionTypes: ActionTypeOption[] = [
    {
      value: ActionType.HTTP_REQUEST,
      label: "HTTP Request",
      icon: GlobeAltIcon,
      description: "Make API calls to external services",
    },
    {
      value: ActionType.WEBHOOK,
      label: "Webhook",
      icon: BoltIcon,
      description: "Send data to webhook endpoints",
    },
    {
      value: ActionType.EMAIL,
      label: "Email",
      icon: EnvelopeIcon,
      description: "Send email notifications",
    },
    {
      value: ActionType.SMS,
      label: "SMS",
      icon: DevicePhoneMobileIcon,
      description: "Send text messages",
    },
  ];

  const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"] as const;
  type HttpMethod = (typeof httpMethods)[number];

  const config = selectedNode.data.config as BaseActionConfig;
  const currentActionType = config?.actionType || ActionType.HTTP_REQUEST;

  const updateHeaders = (headerString: string) => {
    try {
      // Parse headers from string format "key: value\nkey2: value2"
      const headers: Record<string, string> = {};
      headerString.split("\n").forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          if (key && value) {
            headers[key] = value;
          }
        }
      });
      updateConfig("headers", headers);
    } catch (error) {
      console.error("Error parsing headers:", error);
    }
  };

  const getHeadersString = (): string => {
    const headers = config?.headers || {};
    return Object.entries(headers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
  };

  const updateRequestBody = (bodyString: string) => {
    try {
      if (bodyString.trim()) {
        const parsedBody = JSON.parse(bodyString);
        updateConfig("body", parsedBody);
        setJsonError("");
      } else {
        updateConfig("body", {});
        setJsonError("");
      }
    } catch (error) {
      setJsonError("Invalid JSON format");
      // Still update to allow user to continue typing
      updateConfig("body", bodyString);
    }
  };

  const getBodyString = (): string => {
    const body = config?.body;
    if (typeof body === "string") return body;
    if (typeof body === "object" && body !== null) {
      return JSON.stringify(body, null, 2);
    }
    return "";
  };

  const commonHeaders = [
    "Content-Type: application/json",
    "Authorization: Bearer {{api_token}}",
    "X-API-Key: {{api_key}}",
    "Accept: application/json",
    "User-Agent: FlowBuilder/1.0",
  ];

  const addCommonHeader = (header: string) => {
    const currentHeaders = getHeadersString();
    const newHeaders = currentHeaders ? `${currentHeaders}\n${header}` : header;
    updateHeaders(newHeaders);
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Action Type
        </label>
        <div className="space-y-2">
          {actionTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <div
                key={type.value}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  currentActionType === type.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => updateConfig("actionType", type.value)}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                  <div>
                    <div className="font-medium text-sm">{type.label}</div>
                    <div className="text-xs text-gray-500">
                      {type.description}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* HTTP Request / Webhook Configuration */}
      {(currentActionType === ActionType.HTTP_REQUEST ||
        currentActionType === ActionType.WEBHOOK) && (
        <>
          <div>
            <TextInput
              label="URL"
              labelClassName="block text-xs font-medium text-gray-700 mb-1"
              type="url"
              value={config?.url || ""}
              onChange={(value) => updateConfig("url", value)}
              placeholder="https://api.example.com/endpoint"
              size="sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              Use {`variable_name`} for dynamic URLs
            </div>
          </div>

          <Select
            label="Method"
            value={config?.method || "POST"}
            onChange={(value) => updateConfig("method", value as HttpMethod)}
            options={httpMethods.map((method) => ({
              value: method,
              label: method,
            }))}
          />

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700">
                Headers
              </label>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                {showAdvanced ? (
                  <EyeSlashIcon className="w-3 h-3" />
                ) : (
                  <EyeIcon className="w-3 h-3" />
                )}
                {showAdvanced ? "Hide" : "Show"} Common Headers
              </button>
            </div>

            {showAdvanced && (
              <div className="mb-2 p-2 bg-gray-50 rounded text-xs">
                <div className="font-medium text-gray-700 mb-1">Quick Add:</div>
                <div className="space-y-1">
                  {commonHeaders.map((header, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addCommonHeader(header)}
                      className="block w-full text-left px-2 py-1 hover:bg-gray-100 rounded font-mono"
                    >
                      {header}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Textarea
              value={getHeadersString()}
              onChange={(value) => updateHeaders(value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="Content-Type: application/json&#10;Authorization: Bearer {{api_token}}"
            />
            <div className="text-xs text-gray-500 mt-1">
              Format: "Key: Value" (one per line)
            </div>
          </div>

          {config?.method !== "GET" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Request Body (JSON)
              </label>
              <Textarea
                value={getBodyString()}
                onChange={(value) => updateRequestBody(value)}
                rows={6}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 font-mono text-sm ${
                  jsonError
                    ? "border-red-300 focus:ring-red-500"
                    : "border-gray-300 focus:ring-blue-500"
                }`}
                placeholder='{"user_id": "{{user.id}}", "message": "{{message_content}}"}'
              />
              {jsonError && (
                <div className="text-xs text-red-600 mt-1">{jsonError}</div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Use {`variable_name`} for dynamic values
              </div>
            </div>
          )}

          {/* Request Preview */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="text-xs font-medium text-gray-700 mb-2">
              Request Preview:
            </h5>
            <div className="font-mono text-xs text-gray-600 space-y-1">
              <div>
                <span className="font-bold">{config?.method || "POST"}</span>{" "}
                {config?.url || "URL"}
              </div>
              {Object.keys(config?.headers || {}).length > 0 && (
                <div className="text-gray-500">
                  Headers: {Object.keys(config?.headers ?? {})?.length} defined
                </div>
              )}
              {config?.method !== "GET" && config?.body && (
                <div className="text-gray-500">Body: JSON payload included</div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Email Configuration */}
      {currentActionType === ActionType.EMAIL && (
        <>
          <TextInput
            label="To Email"
            labelClassName="block text-xs font-medium text-gray-700 mb-1"
            type="email"
            value={config?.to || ""}
            onChange={(value) => updateConfig("to", value)}
            placeholder="{{user.email}} or specific@email.com"
            size="sm"
          />

          <TextInput
            label="Subject"
            labelClassName="block text-xs font-medium text-gray-700 mb-1"
            value={config?.subject || ""}
            onChange={(value) => updateConfig("subject", value)}
            placeholder="Welcome {{user.name}}!"
            size="sm"
          />

          <div>
            <Textarea
              label="HTML Body"
              value={config?.htmlBody || ""}
              onChange={(value) => updateConfig("htmlBody", value)}
              rows={6}
              placeholder="<h1>Welcome!</h1><p>Thanks for joining us, {{user.name}}.</p>"
            />
            <div className="text-xs text-gray-500 mt-1">
              Rich HTML content with variables
            </div>
          </div>

          <div>
            <Textarea
              label="Text Body (Fallback)"
              value={config?.textBody || ""}
              onChange={(value) => updateConfig("textBody", value)}
              rows={4}
              placeholder="Welcome! Thanks for joining us, {{user.name}}."
            />
            <div className="text-xs text-gray-500 mt-1">
              Plain text version for email clients that don't support HTML
            </div>
          </div>

          {/* Email Preview */}
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <h5 className="text-xs font-medium text-blue-700 mb-2">
              📧 Email Preview:
            </h5>
            <div className="text-xs text-blue-600 space-y-1">
              <div>
                <strong>To:</strong> {config?.to || "recipient@email.com"}
              </div>
              <div>
                <strong>Subject:</strong> {config?.subject || "Email Subject"}
              </div>
              <div>
                <strong>Content:</strong>{" "}
                {config?.htmlBody || config?.textBody
                  ? "Content defined"
                  : "No content"}
              </div>
            </div>
          </div>
        </>
      )}

      {/* SMS Configuration */}
      {currentActionType === ActionType.SMS && (
        <>
          <div>
            <TextInput
              label="Phone Number"
              labelClassName="block text-xs font-medium text-gray-700 mb-1"
              type="tel"
              value={config?.phoneNumber || ""}
              onChange={(value) => updateConfig("phoneNumber", value)}
              placeholder="{{user.phone}} or +1234567890"
              size="sm"
            />
            <div className="text-xs text-gray-500 mt-1">
              Include country code for international numbers
            </div>
          </div>

          <div>
            <Textarea
              label="Message"
              value={config?.message || ""}
              onChange={(value) => updateConfig("message", value)}
              rows={4}
              placeholder="Welcome {{user.name}}! Your account is ready."
              maxLength={160}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>SMS message content with variables</span>
              <span
                className={`${
                  (config?.message || "").length > 160 ? "text-red-500" : ""
                }`}
              >
                {(config?.message || "").length}/160 characters
              </span>
            </div>
            {(config?.message || "").length > 160 && (
              <div className="text-xs text-red-600 mt-1">
                ⚠️ Message exceeds SMS limit. Consider splitting into multiple
                messages.
              </div>
            )}
          </div>

          {/* SMS Preview */}
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <h5 className="text-xs font-medium text-green-700 mb-2">
              📱 SMS Preview:
            </h5>
            <div className="text-xs text-green-600 space-y-1">
              <div>
                <strong>To:</strong> {config?.phoneNumber || "+1234567890"}
              </div>
              <div>
                <strong>Message:</strong> {config?.message || "SMS content"}
              </div>
              <div>
                <strong>Length:</strong> {(config?.message || "").length}{" "}
                characters
              </div>
            </div>
          </div>
        </>
      )}

      {/* Action Preview */}
      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-800 font-medium mb-1">
          ⚡ Action Summary:
        </p>
        <p className="text-xs text-gray-700">
          {currentActionType === ActionType.HTTP_REQUEST &&
            `Will send ${config?.method || "POST"} request to ${
              config?.url || "URL"
            }`}
          {currentActionType === ActionType.WEBHOOK &&
            `Will trigger webhook at ${config?.url || "URL"}`}
          {currentActionType === ActionType.EMAIL &&
            `Will send email to ${config?.to || "recipient"} with subject "${
              config?.subject || "subject"
            }"`}
          {currentActionType === ActionType.SMS &&
            `Will send SMS to ${config?.phoneNumber || "phone number"}`}
        </p>
      </div>

      {/* Usage Tips */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800 font-medium mb-1">
          💡 Action Tips:
        </p>
        <ul className="text-xs text-yellow-700 space-y-1">
          {currentActionType === ActionType.HTTP_REQUEST && (
            <>
              <li>• Test your API endpoints before using in production</li>
              <li>• Use authentication headers for secure APIs</li>
              <li>• Handle error responses in your flow logic</li>
            </>
          )}
          {currentActionType === ActionType.EMAIL && (
            <>
              <li>• Always provide both HTML and text versions</li>
              <li>• Keep subject lines under 50 characters</li>
              <li>• Test with different email clients</li>
            </>
          )}
          {currentActionType === ActionType.SMS && (
            <>
              <li>• Keep messages under 160 characters for best delivery</li>
              <li>• Include opt-out instructions for marketing messages</li>
              <li>• Verify phone number format and validity</li>
            </>
          )}
        </ul>
      </div>
    </>
  );
};

export default ActionForm;
