import React from "react";
import {
  UserIcon,
  CpuChipIcon,
  InformationCircleIcon,
  PhotoIcon,
  SpeakerWaveIcon,
  DocumentIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import {
  ChatMessage,
  MessageType,
  ResponseType,
} from "@/flow-builder/types/flow.types";

interface MessageBubbleProps {
  message: ChatMessage;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const formatTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const renderMessageContent = (): React.ReactNode => {
    if (message.messageType === MessageType.JSON) {
      let jsonContent: any;
      try {
        jsonContent =
          typeof message.content === "string"
            ? JSON.parse(message.content)
            : message.content;
      } catch {
        jsonContent = message.content;
      }

      return (
        <div className="space-y-2">
          <div className="bg-gray-100 p-3 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <CodeBracketIcon className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">
                JSON Data
              </span>
            </div>
            <pre className="text-xs font-mono overflow-auto max-h-32 text-gray-800">
              {JSON.stringify(jsonContent, null, 2)}
            </pre>
          </div>
        </div>
      );
    }

    if (message.messageType === MessageType.IMAGE) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 p-3 rounded-lg border">
            <PhotoIcon className="w-5 h-5" />
            <div>
              <div className="font-medium">Image Content</div>
              <div className="text-xs">
                Image would be displayed here in production
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (message.messageType === MessageType.AUDIO) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 p-3 rounded-lg border">
            <SpeakerWaveIcon className="w-5 h-5" />
            <div>
              <div className="font-medium">Audio Content</div>
              <div className="text-xs">
                Audio player would be displayed here in production
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (message.messageType === MessageType.FILE) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-100 p-3 rounded-lg border">
            <DocumentIcon className="w-5 h-5" />
            <div>
              <div className="font-medium">File Attachment</div>
              <div className="text-xs">
                Downloadable file would be available here in production
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default text content
    return (
      <div className="text-sm leading-relaxed">
        {typeof message.content === "string" ? (
          <p>{message.content}</p>
        ) : (
          <p>{JSON.stringify(message.content)}</p>
        )}
      </div>
    );
  };

  const getResponseTypeIcon = (responseType: ResponseType): React.ReactNode => {
    switch (responseType) {
      case ResponseType.EMAIL:
        return "📧";
      case ResponseType.PHONE:
        return "📞";
      case ResponseType.NUMBER:
        return "🔢";
      case ResponseType.FILE:
        return "📎";
      default:
        return "💬";
    }
  };

  if (message.type === "system") {
    return (
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-full text-xs border border-yellow-200">
          <InformationCircleIcon className="w-4 h-4" />
          <span className="font-medium">{message.content}</span>
          <span className="text-yellow-600 ml-2 opacity-75">
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    );
  }

  const isUser = message.type === "user";

  return (
    <div className={`flex mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`flex max-w-[85%] ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? "ml-3" : "mr-3"}`}>
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
              isUser ? "bg-blue-500" : "bg-gray-600"
            }`}
          >
            {isUser ? (
              <UserIcon className="w-4 h-4 text-white" />
            ) : (
              <CpuChipIcon className="w-4 h-4 text-white" />
            )}
          </div>
        </div>

        {/* Message Content */}
        <div
          className={`px-4 py-3 rounded-lg shadow-sm max-w-full ${
            isUser
              ? "bg-blue-500 text-white rounded-br-sm"
              : "bg-white text-gray-800 border border-gray-200 rounded-bl-sm"
          }`}
        >
          {/* Message Body */}
          <div className="mb-2">{renderMessageContent()}</div>

          {/* Message Type Badge */}
          {message.messageType && message.messageType !== MessageType.TEXT && (
            <div
              className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium mb-2 ${
                isUser
                  ? "bg-blue-400 text-blue-100"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {message.messageType === MessageType.IMAGE && (
                <PhotoIcon className="w-3 h-3" />
              )}
              {message.messageType === MessageType.AUDIO && (
                <SpeakerWaveIcon className="w-3 h-3" />
              )}
              {message.messageType === MessageType.FILE && (
                <DocumentIcon className="w-3 h-3" />
              )}
              {message.messageType === MessageType.JSON && (
                <CodeBracketIcon className="w-3 h-3" />
              )}
              {message.messageType}
            </div>
          )}

          {/* Timestamp and metadata */}
          <div
            className={`text-xs flex items-center justify-between ${
              isUser ? "text-blue-100" : "text-gray-500"
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{formatTime(message.timestamp)}</span>
              {message.responseType && (
                <span className="flex items-center gap-1">
                  <span>{getResponseTypeIcon(message.responseType)}</span>
                  <span className="font-medium">({message.responseType})</span>
                </span>
              )}
            </div>

            {/* Node ID for debugging */}
            {message.nodeId && (
              <span
                className={`font-mono opacity-75 ${
                  isUser ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {message.nodeId.slice(0, 8)}
              </span>
            )}
          </div>

          {/* Delivery status for user messages */}
          {isUser && (
            <div className="text-xs text-blue-200 mt-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
              <span>Delivered</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
