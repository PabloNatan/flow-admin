"use client";
import FlowBuilder from "@/flow-builder/FlowBuilder";
import { ReactFlowProvider } from "reactflow";

export default function Home() {
  return (
    <ReactFlowProvider>
      <div className="App">
        <FlowBuilder />
      </div>
    </ReactFlowProvider>
  );
}
