import { BaseTriggerConfig } from "@/flow-builder/types/flow.types";
import React from "react";
import { Node } from "reactflow";
import { Select, Textarea, TextInput } from "../core";

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
      <Select
        label="Event Type"
        value={config?.event || "manual"}
        onChange={(value) => updateConfig("event", value as BaseTriggerConfig["event"])}
        options={eventTypes.map((type) => ({
          value: type.value,
          label: type.label,
        }))}
      />

      <Textarea
        label="Description"
        value={config?.description || ""}
        onChange={(value) => updateConfig("description", value)}
        rows={3}
        placeholder="Describe when this flow should start..."
      />

      {config?.event === "webhook" && (
        <TextInput
          label="Webhook URL"
          type="url"
          value={config?.webhookUrl || ""}
          onChange={(value) => updateConfig("webhookUrl", value)}
          placeholder="https://api.example.com/webhook"
        />
      )}

      {config?.event === "scheduled" && (
        <div>
          <TextInput
            label="Schedule (Cron Format)"
            value={config?.schedule || ""}
            onChange={(value) => updateConfig("schedule", value)}
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
