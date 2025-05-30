import React, { useState } from "react";
import {
  XMarkIcon,
  VariableIcon,
  EyeIcon,
  EyeSlashIcon,
  ClipboardDocumentIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface VariableInspectorProps {
  variables: Record<string, any>;
  onClose: () => void;
}

interface VariableEntry {
  path: string;
  value: any;
  type: string;
}

const VariableInspector: React.FC<VariableInspectorProps> = ({
  variables,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(
    new Set(["user"])
  );
  const [showTypes, setShowTypes] = useState<boolean>(true);

  const flattenVariables = (obj: any, prefix: string = ""): VariableEntry[] => {
    const result: VariableEntry[] = [];

    if (obj === null || obj === undefined) {
      return [{ path: prefix, value: obj, type: typeof obj }];
    }

    if (typeof obj !== "object" || obj instanceof Date) {
      return [{ path: prefix, value: obj, type: typeof obj }];
    }

    if (Array.isArray(obj)) {
      result.push({ path: prefix, value: obj, type: "array" });
      obj.forEach((item, index) => {
        const itemPath = prefix ? `${prefix}[${index}]` : `[${index}]`;
        result.push(...flattenVariables(item, itemPath));
      });
    } else {
      if (prefix) {
        result.push({ path: prefix, value: obj, type: "object" });
      }
      Object.entries(obj).forEach(([key, value]) => {
        const newPath = prefix ? `${prefix}.${key}` : key;
        result.push(...flattenVariables(value, newPath));
      });
    }

    return result;
  };

  const allVariables = flattenVariables(variables);

  const filteredVariables = allVariables.filter(
    (variable) =>
      variable.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      String(variable.value).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string): string => {
    switch (type) {
      case "string":
        return "text-green-600 bg-green-50";
      case "number":
        return "text-blue-600 bg-blue-50";
      case "boolean":
        return "text-purple-600 bg-purple-50";
      case "object":
        return "text-orange-600 bg-orange-50";
      case "array":
        return "text-pink-600 bg-pink-50";
      case "undefined":
        return "text-gray-500 bg-gray-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const renderVariableValue = (value: any, type: string): React.ReactNode => {
    if (value === null)
      return <span className="text-gray-400 italic">null</span>;
    if (value === undefined)
      return <span className="text-gray-400 italic">undefined</span>;

    if (typeof value === "boolean") {
      return (
        <span className="text-purple-600 font-medium">{String(value)}</span>
      );
    }

    if (typeof value === "number") {
      return <span className="text-blue-600 font-medium">{value}</span>;
    }

    if (typeof value === "string") {
      if (value.length > 100) {
        return (
          <span className="text-green-600">
            <span className="opacity-50">"</span>
            {value.substring(0, 100)}...
            <span className="opacity-50">"</span>
          </span>
        );
      }
      return (
        <span className="text-green-600">
          <span className="opacity-50">"</span>
          {value}
          <span className="opacity-50">"</span>
        </span>
      );
    }

    if (Array.isArray(value)) {
      return (
        <span className="text-pink-600">
          Array({value.length})
          {value.length > 0 && (
            <span className="text-gray-500 ml-1">
              [{value.slice(0, 3).map(String).join(", ")}
              {value.length > 3 && "..."}]
            </span>
          )}
        </span>
      );
    }

    if (typeof value === "object") {
      const keys = Object.keys(value);
      return (
        <span className="text-orange-600">
          Object({keys.length})
          {keys.length > 0 && (
            <span className="text-gray-500 ml-1">
              {`{${keys.slice(0, 3).join(", ")}${
                keys.length > 3 ? "..." : ""
              }}`}
            </span>
          )}
        </span>
      );
    }

    return <span className="text-gray-600">{String(value)}</span>;
  };

  const toggleExpanded = (path: string): void => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const copyToClipboard = (text: string): void => {
    navigator.clipboard.writeText(`{{${text}}}`).then(() => {
      // Could add a toast notification here
    });
  };

  const copyValue = (value: any): void => {
    const stringValue =
      typeof value === "string" ? value : JSON.stringify(value, null, 2);
    navigator.clipboard.writeText(stringValue);
  };

  const getIndentLevel = (path: string): number => {
    return (path.match(/\./g) || []).length + (path.match(/\[/g) || []).length;
  };

  const isParentExpanded = (path: string): boolean => {
    const parts = path.split(/[.\[]/).filter(Boolean);
    if (parts.length <= 1) return true;

    for (let i = 1; i < parts.length; i++) {
      const parentPath = parts.slice(0, i).join(".");
      if (!expandedPaths.has(parentPath)) {
        return false;
      }
    }
    return true;
  };

  const shouldShowVariable = (variable: VariableEntry): boolean => {
    if (variable.type === "object" || variable.type === "array") {
      return true;
    }
    return isParentExpanded(variable.path);
  };

  const isExpandable = (type: string): boolean => {
    return type === "object" || type === "array";
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white flex flex-col max-h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <VariableIcon className="w-5 h-5 text-blue-500" />
          <h4 className="font-semibold text-gray-800">Variables</h4>
          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
            {Object.keys(variables).length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Controls */}
      <div className="p-3 border-b border-gray-200 space-y-2">
        {/* Search */}
        <div className="relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Options */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowTypes(!showTypes)}
            className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-800"
          >
            {showTypes ? (
              <EyeSlashIcon className="w-3 h-3" />
            ) : (
              <EyeIcon className="w-3 h-3" />
            )}
            {showTypes ? "Hide" : "Show"} Types
          </button>

          <div className="text-xs text-gray-500">
            {filteredVariables.length} / {allVariables.length}
          </div>
        </div>
      </div>

      {/* Variables List */}
      <div className="flex-1 overflow-y-auto">
        {Object.keys(variables).length === 0 ? (
          <div className="text-center text-gray-500 py-8 px-4">
            <VariableIcon className="w-12 h-12 mx-auto text-gray-300 mb-2" />
            <p className="text-sm mb-1">No variables yet</p>
            <p className="text-xs">
              Variables will appear as the flow executes
            </p>
          </div>
        ) : (
          <div className="p-2">
            {filteredVariables
              .filter(shouldShowVariable)
              .map((variable, index) => {
                const indentLevel = getIndentLevel(variable.path);
                const isExpanded = expandedPaths.has(variable.path);
                const canExpand = isExpandable(variable.type);

                return (
                  <div
                    key={`${variable.path}-${index}`}
                    className="mb-1"
                    style={{ marginLeft: `${indentLevel * 12}px` }}
                  >
                    <div className="group flex items-start gap-2 p-2 rounded hover:bg-gray-50 transition-colors">
                      {/* Expand/Collapse Button */}
                      <div className="w-4 flex justify-center">
                        {canExpand && (
                          <button
                            onClick={() => toggleExpanded(variable.path)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        )}
                      </div>

                      {/* Variable Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <button
                            onClick={() => copyToClipboard(variable.path)}
                            className="font-mono text-sm text-blue-600 hover:text-blue-700 transition-colors cursor-pointer truncate"
                            title="Click to copy variable syntax"
                          >
                            {`${variable.path}`}
                          </button>

                          {showTypes && (
                            <span
                              className={`text-xs px-2 py-1 rounded font-medium ${getTypeColor(
                                variable.type
                              )}`}
                            >
                              {variable.type}
                            </span>
                          )}
                        </div>

                        {!(
                          variable.type === "object" ||
                          variable.type === "array"
                        ) && (
                          <div className="font-mono text-xs text-gray-700 break-all">
                            {renderVariableValue(variable.value, variable.type)}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={() => copyToClipboard(variable.path)}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Copy variable syntax"
                        >
                          <VariableIcon className="w-3 h-3" />
                        </button>
                        {!(
                          variable.type === "object" ||
                          variable.type === "array"
                        ) && (
                          <button
                            onClick={() => copyValue(variable.value)}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy value"
                          >
                            <ClipboardDocumentIcon className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* No Results State */}
        {filteredVariables.length === 0 && searchTerm && (
          <div className="text-center text-gray-500 py-8 px-4">
            <MagnifyingGlassIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">No variables found</p>
            <p className="text-xs">Try adjusting your search term</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-2">
          <div className="font-medium">💡 Variable Inspector Tips:</div>
          <ul className="space-y-1 text-gray-500">
            <li>• Click variable names to copy {`syntax`}</li>
            <li>• Variables update in real-time during flow execution</li>
            <li>• Use dot notation for nested objects (user.name)</li>
            <li>• Hover for copy actions</li>
            <li>• Expand objects/arrays to see nested values</li>
          </ul>
        </div>

        {/* Quick Stats */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-gray-600">
              <span className="font-medium">Total:</span> {allVariables.length}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Filtered:</span>{" "}
              {filteredVariables.length}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Objects:</span>{" "}
              {allVariables.filter((v) => v.type === "object").length}
            </div>
            <div className="text-gray-600">
              <span className="font-medium">Arrays:</span>{" "}
              {allVariables.filter((v) => v.type === "array").length}
            </div>
          </div>
        </div>

        {/* Expand/Collapse All */}
        <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => {
              const allObjectPaths = allVariables
                .filter((v) => v.type === "object" || v.type === "array")
                .map((v) => v.path);
              setExpandedPaths(new Set(allObjectPaths));
            }}
            className="flex-1 text-xs text-blue-600 hover:text-blue-700 py-1 px-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedPaths(new Set())}
            className="flex-1 text-xs text-gray-600 hover:text-gray-700 py-1 px-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>
    </div>
  );
};

export default VariableInspector;
