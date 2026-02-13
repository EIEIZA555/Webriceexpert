/**
 * Mock authentication - ใช้เก็บสถานะและ credentials สำหรับ development
 * จะเปลี่ยนเป็น API จริงภายหลัง
 */

export type UserRole = "admin" | "user";

export const AUTH_STORAGE_KEY = "rice_expert_auth";
export const USERNAME_STORAGE_KEY = "rice_expert_username";
export const ROLE_STORAGE_KEY = "rice_expert_role";

/** Mock users: farmer/1234 = user, admin/admin123 = admin */
const MOCK_USERS: Record<
  string,
  { password: string; role: UserRole }
> = {
  farmer: { password: "1234", role: "user" },
  admin: { password: "admin123", role: "admin" },
};

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(AUTH_STORAGE_KEY) === "true";
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

export function setAuth(username: string, role: UserRole): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEY, "true");
    localStorage.setItem(USERNAME_STORAGE_KEY, username);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  } catch (_) {
    // ignore
  }
}

export function clearAuth(): void {
  try {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USERNAME_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
  } catch (_) {
    // ignore
  }
}

export function validateCredentials(
  username: string,
  password: string
): { ok: true; role: UserRole } | { ok: false } {
  const u = username.trim().toLowerCase();
  const user = MOCK_USERS[u];
  if (!user || user.password !== password) return { ok: false };
  return { ok: true, role: user.role };
}
