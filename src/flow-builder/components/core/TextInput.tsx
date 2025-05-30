import { ComponentPropsWithRef, ElementType, forwardRef } from "react";

interface TextInputProps
  extends Omit<ComponentPropsWithRef<"input">, "onChange"> {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  type?: "text" | "email" | "password" | "url" | "tel";
  label?: string;
  error?: string;
  disabled?: boolean;
  labelClassName?: string;
  measure?: "sm" | "md";
}

export const TextInput = forwardRef<
  ElementType<HTMLInputElement>,
  TextInputProps
>(
  (
    {
      value = "",
      onChange,
      placeholder,
      className,
      type = "text",
      label,
      labelClassName = "block text-sm font-medium text-gray-700 mb-1",
      measure = "md",
      disabled,
      error,
    },
    ref
  ) => {
    const sizeClasses = {
      sm: "w-full text-gray-700 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500",
      md: "w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500",
    };

    const inputClassName = className || sizeClasses[measure];

    return (
      <div>
        {label && <label className={labelClassName}>{label}</label>}
        <input
          ref={ref as any}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inputClassName}
          placeholder={placeholder}
          disabled={disabled}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }
);

TextInput.displayName = "TextInput";
