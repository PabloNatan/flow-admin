import React from "react";
import { VariableIcon, ClockIcon, UserIcon } from "@heroicons/react/24/outline";
import { FlowVariable } from "@/flow-builder/types/flow.types";

interface CommonVariable {
  name: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface VariableHelperProps {
  variables: FlowVariable[];
}

const VariableHelper: React.FC<VariableHelperProps> = ({ variables }) => {
  const commonVariables: CommonVariable[] = [
    { name: "user.name", description: "User's full name", icon: UserIcon },
    { name: "user.email", description: "User's email address", icon: UserIcon },
    { name: "user.phone", description: "User's phone number", icon: UserIcon },
    {
      name: "current_timestamp",
      description: "Current date and time",
      icon: ClockIcon,
    },
    {
      name: "session_id",
      description: "Current session ID",
      icon: VariableIcon,
    },
  ];

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(`{{${text}}}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
          <VariableIcon className="w-4 h-4" />
          Common Variables
        </h4>
        <div className="space-y-2">
          {commonVariables.map((variable) => {
            const IconComponent = variable.icon;
            return (
              <div
                key={variable.name}
                className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                onClick={() => copyToClipboard(variable.name)}
                title="Click to copy"
              >
                <div className="flex items-center gap-2 mb-1">
                  <IconComponent className="w-3 h-3 text-gray-500" />
                  <div className="font-mono text-sm text-blue-600">{`${variable.name}`}</div>
                </div>
                <div className="text-gray-600 text-xs">
                  {variable.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {variables && variables.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center gap-2">
            <VariableIcon className="w-4 h-4" />
            Flow Variables
          </h4>
          <div className="space-y-2">
            {variables.map((variable) => (
              <div
                key={variable.name}
                className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors"
                onClick={() => copyToClipboard(variable.name)}
                title="Click to copy"
              >
                <div className="font-mono text-sm text-blue-600">{`${variable.name}`}</div>
                <div className="text-gray-600 text-xs">
                  Type: {variable.type}
                </div>
                {variable.defaultValue && (
                  <div className="text-gray-500 text-xs">
                    Default: {JSON.stringify(variable.defaultValue)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p className="mb-1 font-medium">💡 How to use variables:</p>
        <p className="mb-1">• Wrap variable names with double curly braces</p>
        <p className="mb-1">• Example: "Hello {`user.name`}, welcome!"</p>
        <p>• Click any variable above to copy it</p>
      </div>
    </div>
  );
};

export default VariableHelper;
