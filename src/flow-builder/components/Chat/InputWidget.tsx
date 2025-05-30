import React, { useRef, useEffect } from "react";
import {
  PaperAirplaneIcon,
  DocumentArrowUpIcon,
} from "@heroicons/react/24/outline";
import { ResponseType } from "@/flow-builder/types/flow.types";
import { ChatTextInput, ChatTextarea } from "../core";

interface InputWidgetProps {
  inputType: ResponseType;
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const InputWidget: React.FC<InputWidgetProps> = ({
  inputType,
  value,
  onChange,
  onSubmit,
  placeholder,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    // Focus input when component mounts or type changes
    if (inputRef.current && !disabled) {
      inputRef.current.focus();
    }
  }, [inputType, disabled]);

  const handleKeyPress = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (): void => {
    if (!value.trim() || disabled) return;
    onSubmit();
  };

  const validateInput = (
    inputValue: string
  ): { isValid: boolean; error?: string } => {
    if (!inputValue.trim()) {
      return { isValid: false, error: "This field is required" };
    }

    switch (inputType) {
      case ResponseType.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inputValue)) {
          return {
            isValid: false,
            error: "Please enter a valid email address",
          };
        }
        break;

      case ResponseType.PHONE:
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(inputValue.replace(/[\s\-\(\)]/g, ""))) {
          return { isValid: false, error: "Please enter a valid phone number" };
        }
        break;

      case ResponseType.NUMBER:
        if (isNaN(Number(inputValue))) {
          return { isValid: false, error: "Please enter a valid number" };
        }
        break;
    }

    return { isValid: true };
  };

  const validation = validateInput(value);
  const canSubmit = value.trim() && validation.isValid && !disabled;

  const renderInput = (): React.ReactNode => {
    const baseClasses = `flex-1 px-3 py-2 border rounded-l-md focus:outline-none focus:ring-2 transition-colors ${
      validation.isValid || !value
        ? "border-gray-300 focus:ring-blue-500"
        : "border-red-300 focus:ring-red-500"
    }`;

    switch (inputType) {
      case ResponseType.TEXT:
        return (
          <ChatTextarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            className={`${baseClasses} resize-none`}
            placeholder={placeholder || "Type your message..."}
            rows={1}
            style={{
              minHeight: "42px",
              maxHeight: "120px",
              resize: "none",
            }}
            disabled={disabled}
          />
        );

      case ResponseType.EMAIL:
        return (
          <ChatTextInput
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="email"
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            className={baseClasses}
            placeholder={placeholder || "Enter your email address..."}
            disabled={disabled}
          />
        );

      case ResponseType.PHONE:
        return (
          <ChatTextInput
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="tel"
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            className={baseClasses}
            placeholder={placeholder || "Enter your phone number..."}
            disabled={disabled}
          />
        );

      case ResponseType.NUMBER:
        return (
          <ChatTextInput
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="number"
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            className={baseClasses}
            placeholder={placeholder || "Enter a number..."}
            disabled={disabled}
          />
        );

      case ResponseType.FILE:
        return (
          <div className="flex-1 flex items-center gap-3 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50">
            <DocumentArrowUpIcon className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <span className="text-gray-600 text-sm">
                {value || "Click to select a file..."}
              </span>
              <input
                ref={inputRef as React.RefObject<HTMLInputElement>}
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    onChange(
                      `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
                    );
                  }
                }}
                className="hidden"
                id="file-input"
                disabled={disabled}
              />
            </div>
            <label
              htmlFor="file-input"
              className={`cursor-pointer text-blue-500 hover:text-blue-600 text-sm font-medium ${
                disabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Browse
            </label>
          </div>
        );

      case ResponseType.JSON:
        return (
          <ChatTextarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            className={`${baseClasses} font-mono text-sm resize-none`}
            placeholder={placeholder || "Enter JSON data..."}
            rows={3}
            style={{
              minHeight: "80px",
              maxHeight: "200px",
            }}
            disabled={disabled}
          />
        );

      default:
        return (
          <ChatTextInput
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={onChange}
            onKeyPress={handleKeyPress}
            className={baseClasses}
            placeholder={placeholder || "Type your response..."}
            disabled={disabled}
          />
        );
    }
  };

  const getInputTypeIcon = (): string => {
    switch (inputType) {
      case ResponseType.EMAIL:
        return "📧";
      case ResponseType.PHONE:
        return "📞";
      case ResponseType.NUMBER:
        return "🔢";
      case ResponseType.FILE:
        return "📎";
      case ResponseType.JSON:
        return "{}";
      default:
        return "💬";
    }
  };

  const getInputTypeLabel = (): string => {
    return inputType.toLowerCase().replace("_", " ");
  };

  return (
    <div className="space-y-2">
      {/* Input Type Indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <span>{getInputTypeIcon()}</span>
        <span className="font-medium">Expected: {getInputTypeLabel()}</span>
        {inputType === ResponseType.PHONE && (
          <span className="text-gray-500">• Include country code</span>
        )}
        {inputType === ResponseType.JSON && (
          <span className="text-gray-500">• Valid JSON format</span>
        )}
      </div>

      {/* Input Area */}
      <div className="flex gap-0">
        {renderInput()}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`px-4 py-2 rounded-r-md flex items-center gap-2 transition-colors font-medium ${
            canSubmit
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <PaperAirplaneIcon className="w-4 h-4" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </div>

      {/* Validation Error */}
      {!validation.isValid && value && (
        <div className="text-xs text-red-600 flex items-center gap-1">
          <span>⚠️</span>
          <span>{validation.error}</span>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-500">
        {inputType === ResponseType.TEXT && (
          <span>💡 Press Enter to send, Shift+Enter for new line</span>
        )}
        {inputType === ResponseType.EMAIL && (
          <span>💡 Make sure to include @ and a valid domain</span>
        )}
        {inputType === ResponseType.PHONE && (
          <span>💡 Format: +1234567890 or (123) 456-7890</span>
        )}
        {inputType === ResponseType.NUMBER && (
          <span>💡 Enter whole numbers or decimals</span>
        )}
        {inputType === ResponseType.FILE && (
          <span>💡 Select any file type (simulation mode)</span>
        )}
        {inputType === ResponseType.JSON && (
          <span>
            💡 Enter valid JSON like {"{"}"key": "value"{"}"}
          </span>
        )}
      </div>
    </div>
  );
};

export default InputWidget;
