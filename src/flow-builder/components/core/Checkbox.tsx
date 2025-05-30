import React from "react";

interface CheckboxProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  className?: string;
  labelClassName?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  id,
  checked,
  onChange,
  label,
  className = "h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded",
  labelClassName = "text-sm text-gray-700",
}) => {
  return (
    <div className="flex items-center">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`mr-2 ${className}`}
      />
      {label && (
        <label htmlFor={id} className={labelClassName}>
          {label}
        </label>
      )}
    </div>
  );
};