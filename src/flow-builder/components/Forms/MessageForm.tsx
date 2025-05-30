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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Message Type
        </label>
        <select
          value={currentType}
          onChange={(e) =>
            updateConfig("messageType", e.target.value as MessageType)
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {messageTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Content
        </label>
        {currentType === MessageType.JSON ? (
          <textarea
            value={
              typeof config?.content === "object"
                ? JSON.stringify(config.content, null, 2)
                : config?.content || ""
            }
            onChange={(e) => {
              try {
                const jsonData = JSON.parse(e.target.value);
                updateConfig("content", jsonData);
              } catch {
                updateConfig("content", e.target.value);
              }
            }}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder='{"type": "card", "title": "Welcome", "buttons": ["Get Started"]}'
          />
        ) : (
          <textarea
            value={typeof config?.content === "string" ? config.content : ""}
            onChange={(e) => updateConfig("content", e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File URL
            </label>
            <input
              type="url"
              value={config?.fileUrl || ""}
              onChange={(e) => updateConfig("fileUrl", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/file.jpg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              File Name
            </label>
            <input
              type="text"
              value={config?.fileName || ""}
              onChange={(e) => updateConfig("fileName", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="filename.jpg"
            />
          </div>

          {currentType === MessageType.FILE && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File Size (bytes)
              </label>
              <input
                type="number"
                value={config?.fileSize || ""}
                onChange={(e) =>
                  updateConfig("fileSize", parseInt(e.target.value) || 0)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="1024000"
              />
            </div>
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
