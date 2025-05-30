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
import { TextInput, NumberInput, Select, Checkbox, Textarea } from "../core";

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
      <Textarea
        label="Prompt"
        value={config?.prompt || ""}
        onChange={(value) => updateConfig("prompt", value)}
        rows={3}
        placeholder="What question would you like to ask?"
      />

      <Select
        label="Response Type"
        value={currentType}
        onChange={(value) => updateConfig("responseType", value as ResponseType)}
        options={responseTypes.map((type) => ({
          value: type.value,
          label: type.label,
        }))}
      />

      <div>
        <TextInput
          label="Variable Name"
          value={config?.variableName || ""}
          onChange={(value) => updateConfig("variableName", value)}
          placeholder="user_response"
        />
        <div className="text-xs text-gray-500 mt-1">
          This will store the user's response
        </div>
      </div>

      <Checkbox
        id="required"
        checked={config?.required || false}
        onChange={(checked) => updateConfig("required", checked)}
        label="Required field"
      />

      {/* Validation Settings */}
      <div className="border-t border-gray-200 pt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-3">Validation</h5>

        {(currentType === ResponseType.TEXT ||
          currentType === ResponseType.EMAIL) && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <NumberInput
                label="Min Length"
                labelClassName="block text-xs font-medium text-gray-700 mb-1"
                value={config?.validation?.minLength || ""}
                onChange={(value) => updateValidation("minLength", value)}
                parseFunction={(val) => parseInt(val) || undefined}
                min={0}
              />
              <NumberInput
                label="Max Length"
                labelClassName="block text-xs font-medium text-gray-700 mb-1"
                value={config?.validation?.maxLength || ""}
                onChange={(value) => updateValidation("maxLength", value)}
                parseFunction={(val) => parseInt(val) || undefined}
                min={1}
              />
            </div>

            <TextInput
              label="Pattern (Regex)"
              labelClassName="block text-xs font-medium text-gray-700 mb-1"
              value={config?.validation?.pattern || ""}
              onChange={(value) => updateValidation("pattern", value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
              placeholder="^[a-zA-Z\s]+$"
            />
          </>
        )}

        {currentType === ResponseType.NUMBER && (
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Min Value"
              labelClassName="block text-xs font-medium text-gray-700 mb-1"
              value={config?.validation?.min || ""}
              onChange={(value) => updateValidation("min", value)}
              parseFunction={(val) => parseFloat(val) || undefined}
            />
            <NumberInput
              label="Max Value"
              labelClassName="block text-xs font-medium text-gray-700 mb-1"
              value={config?.validation?.max || ""}
              onChange={(value) => updateValidation("max", value)}
              parseFunction={(val) => parseFloat(val) || undefined}
            />
          </div>
        )}

        {currentType === ResponseType.FILE && (
          <>
            <TextInput
              label="Allowed File Types"
              labelClassName="block text-xs font-medium text-gray-700 mb-1"
              value={config?.validation?.allowedTypes?.join(", ") || ""}
              onChange={(value) =>
                updateValidation(
                  "allowedTypes",
                  value
                    .split(",")
                    .map((type) => type.trim())
                    .filter(Boolean)
                )
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="image/*, application/pdf"
            />

            <div>
              <NumberInput
                label="Max File Size (bytes)"
                labelClassName="block text-xs font-medium text-gray-700 mb-1"
                value={config?.validation?.maxFileSize || ""}
                onChange={(value) => updateValidation("maxFileSize", value)}
                parseFunction={(val) => parseInt(val) || undefined}
                placeholder="5242880"
              />
              <div className="text-xs text-gray-500 mt-1">
                5MB = 5242880 bytes
              </div>
            </div>
          </>
        )}

        <TextInput
          label="Error Message"
          labelClassName="block text-xs font-medium text-gray-700 mb-1"
          value={config?.validation?.errorMessage || ""}
          onChange={(value) => updateValidation("errorMessage", value)}
          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          placeholder="Please enter a valid value"
        />
      </div>
    </>
  );
};
