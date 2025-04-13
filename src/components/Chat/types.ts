export interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  name?: string;
  intermediateSteps?: IntermediateStep[];
}

export interface IntermediateStep {
  type: "tool_call" | "tool_response" | "thinking";
  content: string;
  timestamp: number;
}
