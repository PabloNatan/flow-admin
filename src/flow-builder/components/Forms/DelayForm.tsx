import { BaseDelayConfig, DelayType } from "@/flow-builder/types/flow.types";
import React from "react";
import { Node } from "reactflow";
import { Select, NumberInput, TextInput } from "../core";

interface DelayOption {
  label: string;
  value: number;
}

interface DelayFormProps {
  selectedNode: Node;
  updateConfig: (field: string, value: any) => void;
}

const DelayForm: React.FC<DelayFormProps> = ({
  selectedNode,
  updateConfig,
}) => {
  const config = selectedNode.data.config as BaseDelayConfig;
  const delayMs = config?.delayMs || 1000;
  const delayType = config?.delayType || DelayType.FIXED;

  // Convert milliseconds to more readable format
  const formatDelay = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}min`;
  };

  const quickDelays: DelayOption[] = [
    { label: "1 second", value: 1000 },
    { label: "2 seconds", value: 2000 },
    { label: "5 seconds", value: 5000 },
    { label: "10 seconds", value: 10000 },
    { label: "30 seconds", value: 30000 },
    { label: "1 minute", value: 60000 },
    { label: "5 minutes", value: 300000 },
  ];

  const handleDelayTypeChange = (newType: DelayType) => {
    updateConfig("delayType", newType);
    // Reset values when switching types
    if (newType === DelayType.FIXED && !config?.delayMs) {
      updateConfig("delayMs", 1000);
    }
  };

  const handleDelayMsChange = (value: string) => {
    const numValue = parseInt(value) || 1000;
    updateConfig("delayMs", Math.max(100, numValue)); // Minimum 100ms
  };

  return (
    <>
      <Select
        label="Delay Type"
        value={delayType}
        onChange={(value) => handleDelayTypeChange(value as DelayType)}
        options={[
          { value: DelayType.FIXED, label: "Fixed Delay" },
          { value: DelayType.VARIABLE, label: "Variable Delay" },
        ]}
      />

      {delayType === DelayType.FIXED ? (
        <>
          <div>
            <NumberInput
              label="Delay Duration"
              value={delayMs}
              onChange={(value) => handleDelayMsChange(String(value || 1000))}
              min={100}
              step={100}
              placeholder="1000"
            />
            <div className="text-xs text-gray-500 mt-1">
              Duration in milliseconds. Current:{" "}
              <span className="font-medium">{formatDelay(delayMs)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickDelays.map((delay) => (
                <button
                  key={delay.value}
                  type="button"
                  onClick={() => updateConfig("delayMs", delay.value)}
                  className={`px-2 py-1 text-xs border rounded transition-colors ${
                    delayMs === delay.value
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {delay.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom duration input for common time units */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Duration
            </label>
            <div className="grid grid-cols-3 gap-2">
              <NumberInput
                label="Seconds"
                labelClassName="block text-xs text-gray-600 mb-1"
                value={Math.round(delayMs / 1000)}
                onChange={(value) => updateConfig("delayMs", (value || 0) * 1000)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min={0}
                step={1}
              />
              <NumberInput
                label="Minutes"
                labelClassName="block text-xs text-gray-600 mb-1"
                value={Math.round(delayMs / 60000)}
                onChange={(value) => updateConfig("delayMs", (value || 0) * 60000)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min={0}
                step={1}
              />
              <NumberInput
                label="Hours"
                labelClassName="block text-xs text-gray-600 mb-1"
                value={Math.round(delayMs / 3600000)}
                onChange={(value) => updateConfig("delayMs", (value || 0) * 3600000)}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min={0}
                step={1}
              />
            </div>
          </div>
        </>
      ) : (
        <div>
          <TextInput
            label="Variable Name"
            value={config?.delayVariable || ""}
            onChange={(value) => updateConfig("delayVariable", value)}
            placeholder="wait_time"
          />
          <div className="text-xs text-gray-500 mt-1">
            Variable should contain delay duration in milliseconds
          </div>

          {/* Variable examples */}
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
            <div className="font-medium text-gray-700 mb-1">Examples:</div>
            <div className="text-gray-600 space-y-1">
              <div>• Variable "wait_time" = 5000 → 5 second delay</div>
              <div>• Variable "user_delay" = 30000 → 30 second delay</div>
            </div>
          </div>
        </div>
      )}

      <TextInput
        label="Description"
        value={config?.description || ""}
        onChange={(value) => updateConfig("description", value)}
        placeholder="Brief pause before next message"
      />

      {/* Preview */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-800 font-medium mb-1">
          ⏱️ Delay Preview:
        </p>
        <p className="text-xs text-blue-700">
          {delayType === DelayType.FIXED
            ? `Flow will pause for ${formatDelay(delayMs)} before continuing`
            : `Flow will pause for the duration specified in variable "${
                config?.delayVariable || "wait_time"
              }"`}
        </p>
        {delayType === DelayType.FIXED && delayMs > 300000 && (
          <p className="text-xs text-orange-600 mt-1">
            ⚠️ Long delays may affect user experience
          </p>
        )}
      </div>

      {/* Usage Tips */}
      <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
        <p className="text-xs text-yellow-800 font-medium mb-1">
          💡 Delay Best Practices:
        </p>
        <ul className="text-xs text-yellow-700 space-y-1">
          <li>• Use short delays (1-5s) for natural conversation flow</li>
          <li>• Longer delays work well for processing time simulation</li>
          <li>• Variable delays allow dynamic timing based on user data</li>
          {delayType === DelayType.VARIABLE && (
            <li>• Ensure the variable exists before this node executes</li>
          )}
        </ul>
      </div>
    </>
  );
};

export default DelayForm;
