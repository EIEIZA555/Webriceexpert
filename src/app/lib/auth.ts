import { apiFetch, clearAuthToken, setAuthToken } from "./api";

export type UserRole = "admin" | "user";

const USERNAME_STORAGE_KEY = "rice_expert_username";
const ROLE_STORAGE_KEY = "rice_expert_role";

interface LoginResponse {
  access_token: string;
  token_type: string;
}

interface MeResponse {
  id: string;
  username: string;
  role: UserRole;
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!localStorage.getItem("rice_expert_access_token");
  } catch {
    return false;
  }
}

export function getUsername(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(USERNAME_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function getRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  try {
    const r = localStorage.getItem(ROLE_STORAGE_KEY);
    return r === "admin" || r === "user" ? r : null;
  } catch {
    return null;
  }
}

export function isAdmin(): boolean {
  return getRole() === "admin";
}

export async function login(username: string, password: string): Promise<void> {
  const data = await apiFetch<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  setAuthToken(data.access_token);

  const me = await apiFetch<MeResponse>("/auth/me", {}, true);

  try {
    localStorage.setItem(USERNAME_STORAGE_KEY, me.username);
    localStorage.setItem(ROLE_STORAGE_KEY, me.role);
  } catch {
    // ignore
  }
}

export async function register(
  username: string,
  password: string,
): Promise<void> {
  const data = await apiFetch<LoginResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  setAuthToken(data.access_token);

  const me = await apiFetch<MeResponse>("/auth/me", {}, true);

  try {
    localStorage.setItem(USERNAME_STORAGE_KEY, me.username);
    localStorage.setItem(ROLE_STORAGE_KEY, me.role);
  } catch {
    // ignore
  }
}

export function clearAuth(): void {
  clearAuthToken();
  try {
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  } catch {
    // ignore
  }
}

