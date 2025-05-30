import React, { forwardRef } from "react";

interface ChatTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  style?: React.CSSProperties;
  disabled?: boolean;
}

export const ChatTextarea = forwardRef<HTMLTextAreaElement, ChatTextareaProps>(
  (
    {
      value,
      onChange,
      onKeyPress,
      placeholder,
      className,
      rows,
      style,
      disabled = false,
    },
    ref
  ) => {
    return (
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={onKeyPress}
        className={className}
        placeholder={placeholder}
        rows={rows}
        style={style}
        disabled={disabled}
      />
    );
  }
);

ChatTextarea.displayName = "ChatTextarea";