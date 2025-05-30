import { BaseTriggerConfig } from "@/flow-builder/types/flow.types";
import React from "react";
import { Node } from "reactflow";

interface EventType {
  value: BaseTriggerConfig["event"];
  label: string;
}

interface TriggerFormProps {
  selectedNode: Node;
  updateConfig: (field: string, value: any) => void;
}

const TriggerForm: React.FC<TriggerFormProps> = ({
  selectedNode,
  updateConfig,
}) => {
  const eventTypes: EventType[] = [
    { value: "manual", label: "Manual Trigger" },
    { value: "webhook", label: "Webhook" },
    { value: "scheduled", label: "Scheduled" },
    { value: "user_action", label: "User Action" },
  ];

  const config = selectedNode.data.config as BaseTriggerConfig;

  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Event Type
        </label>
        <select
          value={config?.event || "manual"}
          onChange={(e) =>
            updateConfig("event", e.target.value as BaseTriggerConfig["event"])
          }
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {eventTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={config?.description || ""}
          onChange={(e) => updateConfig("description", e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe when this flow should start..."
        />
      </div>

      {config?.event === "webhook" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Webhook URL
          </label>
          <input
            type="url"
            value={config?.webhookUrl || ""}
            onChange={(e) => updateConfig("webhookUrl", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://api.example.com/webhook"
          />
        </div>
      )}

      {config?.event === "scheduled" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Schedule (Cron Format)
          </label>
          <input
            type="text"
            value={config?.schedule || ""}
            onChange={(e) => updateConfig("schedule", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0 9 * * * (Every day at 9 AM)"
          />
          <div className="text-xs text-gray-500 mt-1">
            Format: minute hour day month weekday
          </div>
        </div>
      )}
    </>
  );
};

export default TriggerForm;
