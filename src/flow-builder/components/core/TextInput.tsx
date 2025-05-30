import React from "react";

interface TextInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "email" | "password" | "url" | "tel";
  label?: string;
  labelClassName?: string;
  size?: "sm" | "md";
}

export const TextInput: React.FC<TextInputProps> = ({
  value = "",
  onChange,
  placeholder,
  className,
  type = "text",
  label,
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-full text-gray-700 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
    md: "w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  };

  const inputClassName = className || sizeClasses[size];

  return (
    <div>
      {label && <label className={labelClassName}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClassName}
        placeholder={placeholder}
      />
    </div>
  );
};
