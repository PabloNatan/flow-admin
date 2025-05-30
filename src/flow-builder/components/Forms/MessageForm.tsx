import React from "react";
import { Node } from "reactflow";
import {
  DocumentTextIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  CodeBracketIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import {
  BaseMessageConfig,
  MessageType,
} from "@/flow-builder/types/flow.types";
import { Select, Textarea, TextInput, NumberInput } from "../core";

interface MessageTypeOption {
  value: MessageType;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface MessageFormProps {
  selectedNode: Node;
  updateConfig: (field: string, value: any) => void;
}

const MessageForm: React.FC<MessageFormProps> = ({
  selectedNode,
  updateConfig,
}) => {
  const messageTypes: MessageTypeOption[] = [
    { value: MessageType.TEXT, label: "Text", icon: DocumentTextIcon },
    { value: MessageType.IMAGE, label: "Image", icon: PhotoIcon },
    { value: MessageType.AUDIO, label: "Audio", icon: SpeakerWaveIcon },
    { value: MessageType.JSON, label: "JSON", icon: CodeBracketIcon },
    { value: MessageType.FILE, label: "File", icon: DocumentArrowUpIcon },
  ];

  const config = selectedNode.data.config as BaseMessageConfig;
  const currentType = config?.messageType || MessageType.TEXT;

  return (
    <>
      <Select
        label="Message Type"
        value={currentType}
        onChange={(value) => updateConfig("messageType", value as MessageType)}
        options={messageTypes.map((type) => ({
          value: type.value,
          label: type.label,
        }))}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        {currentType === MessageType.JSON ? (
          <Textarea
            value={
              typeof config?.content === "object"
                ? JSON.stringify(config.content, null, 2)
                : config?.content || ""
            }
            onChange={(value) => {
              try {
                const jsonData = JSON.parse(value);
                updateConfig("content", jsonData);
              } catch {
                updateConfig("content", value);
              }
            }}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder='{"type": "card", "title": "Welcome", "buttons": ["Get Started"]}'
          />
        ) : (
          <Textarea
            value={typeof config?.content === "string" ? config.content : ""}
            onChange={(value) => updateConfig("content", value)}
            rows={4}
            placeholder="Enter message content... Use {{variable}} for dynamic content"
          />
        )}
        <div className="text-xs text-gray-500 mt-1">
          Use {`user.name`} or {`variable_name`} for dynamic content
        </div>
      </div>

      {(currentType === MessageType.IMAGE ||
        currentType === MessageType.AUDIO ||
        currentType === MessageType.FILE) && (
        <>
          <TextInput
            label="File URL"
            labelClassName="block text-xs font-medium text-gray-700 mb-1"
            type="url"
            value={config?.fileUrl || ""}
            onChange={(value) => updateConfig("fileUrl", value)}
            placeholder="https://example.com/file.jpg"
            size="sm"
          />

          <TextInput
            label="File Name"
            labelClassName="block text-xs font-medium text-gray-700 mb-1"
            value={config?.fileName || ""}
            onChange={(value) => updateConfig("fileName", value)}
            placeholder="filename.jpg"
            size="sm"
          />

          {currentType === MessageType.FILE && (
            <NumberInput
              label="File Size (bytes)"
              value={config?.fileSize || ""}
              onChange={(value) => updateConfig("fileSize", value || 0)}
              parseFunction={(val) => parseInt(val) || 0}
              placeholder="1024000"
            />
          )}
        </>
      )}

      {/* Preview Section */}
      {config?.content && (
        <div className="bg-gray-50 p-3 rounded-lg">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Preview:</h5>
          <div className="text-sm text-gray-600">
            {currentType === MessageType.JSON ? (
              <pre className="text-xs overflow-auto">
                {JSON.stringify(
                  typeof config.content === "object"
                    ? config.content
                    : config.content,
                  null,
                  2
                )}
              </pre>
            ) : (
              <p>
                {typeof config.content === "string"
                  ? config.content
                  : JSON.stringify(config.content)}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default MessageForm;
