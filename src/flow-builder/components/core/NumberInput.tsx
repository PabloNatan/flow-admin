import React from "react";

interface NumberInputProps {
  value?: number | string;
  onChange: (value: number | undefined) => void;
  placeholder?: string;
  className?: string;
  min?: number;
  max?: number;
  step?: number;
  parseFunction?: (value: string) => number | undefined;
  label?: string;
  labelClassName?: string;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value = "",
  onChange,
  placeholder,
  className = "w-full px-2 py-1 border border-gray-300 rounded text-sm",
  min,
  max,
  step,
  parseFunction = (val) => parseFloat(val) || undefined,
  label,
  labelClassName = "block text-xs font-medium text-gray-700 mb-1",
}) => {
  return (
    <div>
      {label && (
        <label className={labelClassName}>
          {label}
        </label>
      )}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFunction(e.target.value))}
        className={className}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
      />
    </div>
  );
};