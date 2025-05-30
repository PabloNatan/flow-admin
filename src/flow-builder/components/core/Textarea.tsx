import React from "react";

interface TextareaProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  rows?: number;
  label?: string;
  labelClassName?: string;
  maxLength?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  value = "",
  onChange,
  placeholder,
  className = "w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  rows = 3,
  label,
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
  maxLength,
}) => {
  return (
    <div>
      {label && <label className={labelClassName}>{label}</label>}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className={className}
        placeholder={placeholder}
        maxLength={maxLength}
      />
    </div>
  );
};
