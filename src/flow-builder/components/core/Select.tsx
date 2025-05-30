import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  className?: string;
  placeholder?: string;
  label?: string;
  labelClassName?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  className = "w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
  placeholder,
  label,
  labelClassName = "block text-sm font-medium text-gray-700 mb-1",
}) => {
  return (
    <div>
      {label && <label className={labelClassName}>{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
