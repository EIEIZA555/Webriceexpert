export const API_BASE_URL = "http://localhost:8000";

import type { CollectionItem, DocumentResponse } from "./types";

export type { CollectionItem, DocumentResponse } from "./types";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("rice_expert_access_token");
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  try {
    localStorage.setItem("rice_expert_access_token", token);
  } catch {
    // ignore
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem("rice_expert_access_token");
  } catch {
    // ignore
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false,
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (requireAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let detail = `Request failed with status ${res.status}`;
    try {
      const data = (await res.json()) as { detail?: string };
      if (data.detail) detail = data.detail;
    } catch {
      // ignore
    }
    throw new Error(detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function fetchDocsAndCollections(): Promise<{
  documents: DocumentResponse[];
  collections: CollectionItem[];
}> {
  const [documents, collections] = await Promise.all([
    apiFetch<DocumentResponse[]>("/documents/", {}, false),
    apiFetch<CollectionItem[]>("/documents/collections", {}, false),
  ]);
  return { documents, collections };
}
