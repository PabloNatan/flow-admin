import React from "react";

interface TextInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "email" | "password";
  label?: string;
  labelClassName?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  value = "",
  onChange,
  placeholder,
  className = "w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  type = "text",
  label,
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
}) => {
  return (
    <div>
      {label && <label className={labelClassName}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        placeholder={placeholder}
      />
    </div>
  );
};
