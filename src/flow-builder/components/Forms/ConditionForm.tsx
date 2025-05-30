import React from "react";
import { Node } from "reactflow";
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import {
  BaseConditionConfig,
  Condition,
  ConditionOperator,
  ConditionOperators,
  FlowVariable,
} from "@/flow-builder/types/flow.types";

interface ConditionFormProps {
  selectedNode: Node;
  updateConfig: (field: string, value: any) => void;
  variables: FlowVariable[];
}

export const ConditionForm: React.FC<ConditionFormProps> = ({
  selectedNode,
  updateConfig,
  variables,
}) => {
  const config = selectedNode.data.config as BaseConditionConfig;
  const conditions = config?.conditions || [];

  const addCondition = () => {
    const newConditions: Condition[] = [
      ...conditions,
      {
        id: `condition-${Date.now()}`,
        variable: "",
        operator: "equals",
        value: "",
        label: `Condition ${conditions.length + 1}`,
      },
    ];
    updateConfig("conditions", newConditions);
  };

  const updateCondition = (
    index: number,
    field: keyof Condition,
    value: string | number | boolean
  ) => {
    const newConditions = [...conditions];
    newConditions[index] = { ...newConditions[index], [field]: value };
    updateConfig("conditions", newConditions);
  };

  const removeCondition = (index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    updateConfig("conditions", newConditions);
  };

  return (
    <>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-gray-800">Conditions</h4>
        <button
          onClick={addCondition}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center gap-1 transition-colors"
        >
          <PlusIcon className="w-3 h-3" />
          Add
        </button>
      </div>

      {conditions.length === 0 && (
        <div className="text-center py-6 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
          <p className="text-sm">No conditions yet</p>
          <p className="text-xs">Click "Add" to create your first condition</p>
        </div>
      )}

      {conditions.map((condition, index) => (
        <div
          key={condition.id}
          className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Condition {index + 1}
            </span>
            <button
              onClick={() => removeCondition(index)}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Path Label
            </label>
            <input
              type="text"
              placeholder="e.g., 'Adult Path', 'Premium User'"
              value={condition.label}
              onChange={(e) => updateCondition(index, "label", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Variable Name
            </label>
            <input
              type="text"
              list={`variables-${index}`}
              placeholder="e.g., 'user_age', 'user_type'"
              value={condition.variable}
              onChange={(e) =>
                updateCondition(index, "variable", e.target.value)
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <datalist id={`variables-${index}`}>
              {variables?.map((variable) => (
                <option key={variable.name} value={variable.name} />
              ))}
              <option value="user.name" />
              <option value="user.email" />
              <option value="user.phone" />
            </datalist>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Operator
            </label>
            <select
              value={condition.operator}
              onChange={(e) =>
                updateCondition(
                  index,
                  "operator",
                  e.target.value as ConditionOperator
                )
              }
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {ConditionOperators.map((op) => (
                <option key={op} value={op}>
                  {op
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Value
            </label>
            <input
              type="text"
              placeholder="Comparison value"
              value={condition.value as string}
              onChange={(e) => updateCondition(index, "value", e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="bg-blue-50 p-2 rounded text-xs text-blue-700">
            <strong>Logic:</strong> If {condition.variable || "variable"}{" "}
            {condition.operator.replace("_", " ")} "{condition.value || "value"}
            ", follow "{condition.label || "this path"}"
          </div>
        </div>
      ))}

      <div className="border-t border-gray-200 pt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Default Path Label
          </label>
          <input
            type="text"
            value={config?.defaultCondition?.label || "Default"}
            onChange={(e) =>
              updateConfig("defaultCondition", {
                id: "default",
                label: e.target.value,
              })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Default path (when no conditions match)"
          />
          <div className="text-xs text-gray-500 mt-1">
            This path will be taken if none of the conditions above are met
          </div>
        </div>
      </div>

      {conditions.length > 0 && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-800 font-medium mb-1">
            💡 How conditions work:
          </p>
          <p className="text-xs text-yellow-700">
            Conditions are evaluated in order. The first matching condition
            determines the path. If no conditions match, the default path is
            taken.
          </p>
        </div>
      )}
    </>
  );
};
