"use client";

import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Controller, useForm } from "react-hook-form";
import { flowApi, ApiError } from "../../services/api";
import { NodeType } from "../../types/flow.types";
import { getDefaultConfig } from "../../types/nodeType.types";
import { TextInput } from "../core";

interface NewFlowDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onFlowCreated: (flowId: string) => void;
}

interface NewFlowFormData {
  name: string;
  description: string;
  startWithTemplate: boolean;
  templateType: "blank" | "welcome" | "survey" | "notification";
}

const NewFlowDialog: React.FC<NewFlowDialogProps> = ({
  isOpen,
  onClose,
  onFlowCreated,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewFlowFormData>({
    defaultValues: {
      name: "",
      description: "",
      startWithTemplate: false,
      templateType: "blank",
    },
  });

  const startWithTemplate = watch("startWithTemplate");
  const templateType = watch("templateType");

  // Template configurations
  const templates = {
    blank: {
      name: "Blank Flow",
      description: "Start with just a trigger node",
      icon: "📄",
      nodes: [
        {
          type: NodeType.TRIGGER,
          position: { x: 200, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.TRIGGER),
            name: "Flow Start",
            event: "manual",
          },
        },
      ],
      edges: [],
    },
    welcome: {
      name: "Welcome Flow",
      description: "Greet new users with a series of messages",
      icon: "👋",
      nodes: [
        {
          type: NodeType.TRIGGER,
          position: { x: 100, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.TRIGGER),
            name: "User Signup",
            event: "webhook",
          },
        },
        {
          type: NodeType.MESSAGE,
          position: { x: 300, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.MESSAGE),
            name: "Welcome Message",
            messageType: "TEXT",
            content: "Hello {{user.name}}! Welcome to our platform! 👋",
          },
        },
        {
          type: NodeType.DELAY,
          position: { x: 500, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.DELAY),
            name: "Wait 2 seconds",
            delayType: "FIXED",
            delayMs: 2000,
          },
        },
        {
          type: NodeType.MESSAGE,
          position: { x: 700, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.MESSAGE),
            name: "Getting Started",
            messageType: "TEXT",
            content: "Here are some things you can do to get started...",
          },
        },
        {
          type: NodeType.END,
          position: { x: 900, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.END),
            name: "Complete",
            message: "Welcome flow completed!",
          },
        },
      ],
      edges: [
        { id: "edge-1", sourceId: "node-1", targetId: "node-2" },
        { id: "edge-2", sourceId: "node-2", targetId: "node-3" },
        { id: "edge-3", sourceId: "node-3", targetId: "node-4" },
        { id: "edge-4", sourceId: "node-4", targetId: "node-5" },
      ],
    },
    survey: {
      name: "Survey Flow",
      description: "Collect user feedback with input nodes",
      icon: "📋",
      nodes: [
        {
          type: NodeType.TRIGGER,
          position: { x: 100, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.TRIGGER),
            name: "Start Survey",
            event: "manual",
          },
        },
        {
          type: NodeType.MESSAGE,
          position: { x: 300, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.MESSAGE),
            name: "Survey Intro",
            messageType: "TEXT",
            content:
              "Thank you for taking our survey! This will only take a few minutes.",
          },
        },
        {
          type: NodeType.INPUT,
          position: { x: 500, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.INPUT),
            name: "Name Input",
            prompt: "What is your name?",
            responseType: "TEXT",
            variableName: "user_name",
            required: true,
          },
        },
        {
          type: NodeType.INPUT,
          position: { x: 700, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.INPUT),
            name: "Rating Input",
            prompt: "How would you rate our service? (1-10)",
            responseType: "NUMBER",
            variableName: "service_rating",
            required: true,
          },
        },
        {
          type: NodeType.END,
          position: { x: 900, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.END),
            name: "Thank You",
            message: "Thank you {{user_name}} for your feedback!",
          },
        },
      ],
      edges: [
        { id: "edge-1", sourceId: "node-1", targetId: "node-2" },
        { id: "edge-2", sourceId: "node-2", targetId: "node-3" },
        { id: "edge-3", sourceId: "node-3", targetId: "node-4" },
        { id: "edge-4", sourceId: "node-4", targetId: "node-5" },
      ],
    },
    notification: {
      name: "Notification Flow",
      description: "Send timed notifications with delays",
      icon: "🔔",
      nodes: [
        {
          type: NodeType.TRIGGER,
          position: { x: 100, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.TRIGGER),
            name: "Schedule Trigger",
            event: "scheduled",
          },
        },
        {
          type: NodeType.MESSAGE,
          position: { x: 300, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.MESSAGE),
            name: "First Reminder",
            messageType: "TEXT",
            content: "Don't forget about your upcoming appointment!",
          },
        },
        {
          type: NodeType.DELAY,
          position: { x: 500, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.DELAY),
            name: "Wait 1 day",
            delayType: "FIXED",
            delayMs: 86400000, // 1 day
          },
        },
        {
          type: NodeType.MESSAGE,
          position: { x: 700, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.MESSAGE),
            name: "Final Reminder",
            messageType: "TEXT",
            content: "Your appointment is tomorrow at {{appointment.time}}",
          },
        },
        {
          type: NodeType.END,
          position: { x: 900, y: 100 },
          config: {
            ...getDefaultConfig(NodeType.END),
            name: "Complete",
            message: "Notification sequence completed",
          },
        },
      ],
      edges: [
        { id: "edge-1", sourceId: "node-1", targetId: "node-2" },
        { id: "edge-2", sourceId: "node-2", targetId: "node-3" },
        { id: "edge-3", sourceId: "node-3", targetId: "node-4" },
        { id: "edge-4", sourceId: "node-4", targetId: "node-5" },
      ],
    },
  };

  // Handle form submission
  const onSubmit = async (data: NewFlowFormData) => {
    try {
      setIsCreating(true);
      setError(null);

      const template = templates[data.templateType];

      // Generate unique IDs for nodes and edges
      const nodesWithIds = template.nodes.map((node, index) => ({
        ...node,
        id: `node-${Date.now()}-${index}`,
      }));

      const edgesWithIds = template.edges.map((edge, index) => ({
        ...edge,
        id: `edge-${Date.now()}-${index}`,
        sourceId: nodesWithIds[parseInt(edge.sourceId.split("-")[1]) - 1]?.id,
        targetId: nodesWithIds[parseInt(edge.targetId.split("-")[1]) - 1]?.id,
      }));

      const flowData = {
        name: data.name,
        description: data.description || undefined,
        nodes: nodesWithIds,
        edges: edgesWithIds,
        variables: [],
      };

      const response = await flowApi.createFlow(flowData);

      // Reset form and close dialog
      reset();
      onClose();

      // Notify parent component
      onFlowCreated(response.id);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to create flow: ${err.message}`);
      } else {
        setError("Failed to create flow. Please try again.");
      }
      console.error("Error creating flow:", err);
    } finally {
      setIsCreating(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (!isCreating) {
      reset();
      setError(null);
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Create New Flow
          </h2>
          <button
            onClick={handleClose}
            disabled={isCreating}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-6 space-y-6 overflow-y-auto"
        >
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-red-700 text-sm">{error}</div>
            </div>
          )}

          {/* Flow Name */}

          <Controller
            control={control}
            name="name"
            rules={{
              required: "Flow name is required",
              minLength: { value: 1, message: "Flow name cannot be empty" },
              maxLength: { value: 100, message: "Flow name is too long" },
            }}
            render={({ field }) => (
              <TextInput
                type="text"
                label="Flow Name *"
                placeholder="Enter flow name..."
                value={field.value}
                onChange={(value) => field.onChange(value)}
                disabled={isCreating}
                error={errors?.name?.message}
              />
            )}
          />

          {/* Flow Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register("description", {
                maxLength: { value: 500, message: "Description is too long" },
              })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe what this flow does..."
              disabled={isCreating}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Template Selection */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="checkbox"
                {...register("startWithTemplate")}
                id="startWithTemplate"
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isCreating}
              />
              <label
                htmlFor="startWithTemplate"
                className="text-sm font-medium text-gray-700"
              >
                Start with a template
              </label>
            </div>

            {startWithTemplate && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(templates).map(([key, template]) => (
                  <label
                    key={key}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                      templateType === key
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      {...register("templateType")}
                      value={key}
                      className="sr-only"
                      disabled={isCreating}
                    />
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {template.description}
                        </div>
                      </div>
                    </div>
                    {templateType === key && (
                      <div className="absolute top-2 right-2 text-blue-500">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              disabled={isCreating}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isCreating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Creating...
                </>
              ) : (
                "Create Flow"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewFlowDialog;
