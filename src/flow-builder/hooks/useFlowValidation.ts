import { useCallback } from "react";
import { Node, Edge } from "reactflow";
import { NodeType } from "../types/flow.types";

interface UseFlowValidationParams {
  nodes: Node[];
  edges: Edge[];
  setIsChatOpen: (open: boolean) => void;
}

interface UseFlowValidationReturn {
  handleTest: () => void;
  handleValidate: () => void;
}

export const useFlowValidation = (params: UseFlowValidationParams): UseFlowValidationReturn => {
  const { nodes, edges, setIsChatOpen } = params;

  const handleTest = useCallback((): void => {
    if (nodes.length === 0) {
      alert("Please add some nodes to test the flow");
      return;
    }

    const triggerNodes = nodes.filter((n) => n.data.type === NodeType.TRIGGER);
    if (triggerNodes.length === 0) {
      alert("Please add a TRIGGER node to start the flow");
      return;
    }

    setIsChatOpen(true);
  }, [nodes, setIsChatOpen]);

  const handleValidate = useCallback((): void => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for trigger node
    const triggerNodes = nodes.filter((n) => n.data.type === NodeType.TRIGGER);
    if (triggerNodes.length === 0) {
      errors.push("Flow must have at least one TRIGGER node");
    }
    if (triggerNodes.length > 1) {
      warnings.push("Flow has multiple TRIGGER nodes");
    }

    // Check for end nodes
    const endNodes = nodes.filter((n) => n.data.type === NodeType.END);
    if (endNodes.length === 0) {
      warnings.push("Flow has no END node - users may get stuck");
    }

    // Check for orphaned nodes
    nodes.forEach((node) => {
      const hasIncoming = edges.some((edge) => edge.target === node.id);
      const hasOutgoing = edges.some((edge) => edge.source === node.id);

      if (!hasIncoming && node.data.type !== NodeType.TRIGGER) {
        warnings.push(
          `Node "${node.data.config.name}" has no incoming connections`
        );
      }
      if (!hasOutgoing && node.data.type !== NodeType.END) {
        warnings.push(
          `Node "${node.data.config.name}" has no outgoing connections`
        );
      }
    });

    // Check for required configurations
    nodes.forEach((node) => {
      const config = node.data.config;
      switch (node.data.type) {
        case NodeType.MESSAGE:
          if (!config.content) {
            errors.push(`Message node "${config.name}" has no content`);
          }
          break;
        case NodeType.INPUT:
          if (!config.prompt) {
            errors.push(`Input node "${config.name}" has no prompt`);
          }
          if (!config.variableName) {
            warnings.push(
              `Input node "${config.name}" has no variable name - response won't be stored`
            );
          }
          break;
        case NodeType.CONDITION:
          if (!config.conditions || config.conditions.length === 0) {
            errors.push(
              `Condition node "${config.name}" has no conditions defined`
            );
          }
          break;
        case NodeType.ACTION:
          if (
            !config.url &&
            (config.actionType === "HTTP_REQUEST" || config.actionType === "WEBHOOK")
          ) {
            errors.push(`Action node "${config.name}" has no URL configured`);
          }
          break;
      }
    });

    // Create validation message
    let message = "";
    if (errors.length > 0) {
      message = `❌ Validation failed:\n${errors.map((e) => `• ${e}`).join("\n")}`;
    } else if (warnings.length > 0) {
      message = `⚠️ Validation passed with warnings:\n${warnings
        .map((w) => `• ${w}`)
        .join("\n")}`;
    } else {
      message = "✅ Flow validation successful! No errors or warnings found.";
    }

    if (warnings.length > 0 && errors.length === 0) {
      message +=
        "\n\nWarnings don't prevent flow execution but should be reviewed.";
    }

    alert(message);
  }, [nodes, edges]);

  return {
    handleTest,
    handleValidate,
  };
};