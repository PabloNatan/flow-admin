import React, { forwardRef } from "react";

interface ChatTextInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "email" | "tel" | "number";
  disabled?: boolean;
}

export const ChatTextInput = forwardRef<HTMLInputElement, ChatTextInputProps>(
  (
    {
      value,
      onChange,
      onKeyPress,
      placeholder,
      className,
      type = "text",
      disabled = false,
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        className={className}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }
);

ChatTextInput.displayName = "ChatTextInput";