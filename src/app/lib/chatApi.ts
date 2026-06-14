import { apiFetch } from "./api";
import type { ChatMessage, ChatResponse } from "../components/chat/types";

export function buildChatHistory(
  messages: ChatMessage[],
  options?: { skipWelcomeId?: number },
): Array<{ role: string; content: string }> {
  const skipId = options?.skipWelcomeId ?? -1;

  return messages
    .filter((m) => m.id !== skipId)
    .slice(-10)
    .map((m) => ({
      role: m.sender === "user" ? "user" : "assistant",
      content: m.text,
    }));
}

interface SendChatOptions {
  question: string;
  history: Array<{ role: string; content: string }>;
  authenticated?: boolean;
  planContext?: string;
  collection?: string | null;
  noRag?: boolean;
}

export async function sendChatMessage(options: SendChatOptions): Promise<ChatResponse> {
  const {
    question,
    history,
    authenticated = false,
    planContext,
    collection,
    noRag = false,
  } = options;

  const endpoint = noRag ? "/chat/no-rag" : "/chat/";
  const body: Record<string, unknown> = { question, history };

  if (planContext !== undefined) body.plan_context = planContext;
  if (collection !== undefined) body.collection = collection;

  return apiFetch<ChatResponse>(
    endpoint,
    { method: "POST", body: JSON.stringify(body) },
    authenticated,
  );
}
