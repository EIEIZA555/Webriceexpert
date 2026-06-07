export interface ChatMessage {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp?: Date;
  sources?: string[];
  apiPayload?: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
}
