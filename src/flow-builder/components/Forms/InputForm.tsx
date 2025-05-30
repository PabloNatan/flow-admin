import React from "react";
import { Node } from "reactflow";
import {
  DocumentTextIcon,
  PhoneIcon,
  EnvelopeIcon,
  HashtagIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  BaseInputConfig,
  InputValidation,
  ResponseType,
} from "@/flow-builder/types/flow.types";

interface ResponseTypeOption {
  value: ResponseType;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface InputFormProps {
  selectedNode: Node;
  updateConfig: (field: string, value: any) => void;
}

export const InputForm: React.FC<InputFormProps> = ({
  selectedNode,
  updateConfig,
}) => {
  const responseTypes: ResponseTypeOption[] = [
    { value: ResponseType.TEXT, label: "Text", icon: DocumentTextIcon },
    { value: ResponseType.PHONE, label: "Phone", icon: PhoneIcon },
    { value: ResponseType.EMAIL, label: "Email", icon: EnvelopeIcon },
    { value: ResponseType.NUMBER, label: "Number", icon: HashtagIcon },
    { value: ResponseType.FILE, label: "File", icon: DocumentArrowUpIcon },
  ];

  const config = selectedNode.data.config as BaseInputConfig;
  const currentType = config?.responseType || ResponseType.TEXT;

  const updateValidation = (field: keyof InputValidation, value: any) => {
    updateConfig("validation", {
      ...config?.validation,
      [field]: value,
    });
  };

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Prompt
        </label>
        <textarea
          value={config?.prompt || ""}
          onChange={(e) => updateConfig("prompt", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="What question would you like to ask?"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Response Type
        </label>
        <select
          value={currentType}
          onChange={(e) =>
            updateConfig("responseType", e.target.value as ResponseType)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {responseTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Variable Name
        </label>
        <input
          type="text"
          value={config?.variableName || ""}
          onChange={(e) => updateConfig("variableName", e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="user_response"
        />
        <div className="text-xs text-gray-500 mt-1">
          This will store the user's response
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="required"
          checked={config?.required || false}
          onChange={(e) => updateConfig("required", e.target.checked)}
          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="required" className="text-sm text-gray-700">
          Required field
        </label>
      </div>

      {/* Validation Settings */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Validation</h5>

        {(currentType === ResponseType.TEXT ||
          currentType === ResponseType.EMAIL) && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Min Length
                </label>
                <input
                  type="number"
                  value={config?.validation?.minLength || ""}
                  onChange={(e) =>
                    updateValidation(
                      "minLength",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Max Length
                </label>
                <input
                  type="number"
                  value={config?.validation?.maxLength || ""}
                  onChange={(e) =>
                    updateValidation(
                      "maxLength",
                      parseInt(e.target.value) || undefined
                    )
                  }
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Pattern (Regex)
              </label>
              <input
                type="text"
                value={config?.validation?.pattern || ""}
                onChange={(e) => updateValidation("pattern", e.target.value)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                placeholder="^[a-zA-Z\s]+$"
              />
            </div>
          </>
        )}

        {currentType === ResponseType.NUMBER && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Min Value
              </label>
              <input
                type="number"
                value={config?.validation?.min || ""}
                onChange={(e) =>
                  updateValidation(
                    "min",
                    parseFloat(e.target.value) || undefined
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max Value
              </label>
              <input
                type="number"
                value={config?.validation?.max || ""}
                onChange={(e) =>
                  updateValidation(
                    "max",
                    parseFloat(e.target.value) || undefined
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        )}

        {currentType === ResponseType.FILE && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Allowed File Types
              </label>
              <input
                type="text"
                value={config?.validation?.allowedTypes?.join(", ") || ""}
                onChange={(e) =>
                  updateValidation(
                    "allowedTypes",
                    e.target.value
                      .split(",")
                      .map((type) => type.trim())
                      .filter(Boolean)
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="image/*, application/pdf"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Max File Size (bytes)
              </label>
              <input
                type="number"
                value={config?.validation?.maxFileSize || ""}
                onChange={(e) =>
                  updateValidation(
                    "maxFileSize",
                    parseInt(e.target.value) || undefined
                  )
                }
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="5242880"
              />
              <div className="text-xs text-gray-500 mt-1">
                5MB = 5242880 bytes
              </div>
            </div>
          </>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Error Message
          </label>
          <input
            type="text"
            value={config?.validation?.errorMessage || ""}
            onChange={(e) => updateValidation("errorMessage", e.target.value)}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="Please enter a valid value"
          />
        </div>
      </div>
    </>
  );
};
