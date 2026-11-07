import { API_URL } from "./api";

export type AdminRole = "superadmin" | "seller";

export type AdminSession = {
  token: string;
  role: AdminRole;
  name?: string;
};

const STORAGE_KEY = "instashop_admin_session";

export function getAdminSession(): AdminSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function setAdminSession(session: AdminSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearAdminSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const session = getAdminSession();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
      ...init?.headers,
    },
  });
  const data = await res.json().catch(() => null);
  if (res.status === 401) {
    clearAdminSession();
  }
  if (!res.ok) {
    throw new Error((data && data.error) || "Something went wrong. Please try again.");
  }
  return data as T;
}

export function adminGetJSON<T>(path: string): Promise<T> {
  return adminFetch<T>(path);
}

export function adminPostJSON<T>(path: string, body: unknown): Promise<T> {
  return adminFetch<T>(path, { method: "POST", body: JSON.stringify(body) });
}

export function adminDeleteJSON<T>(path: string): Promise<T> {
  return adminFetch<T>(path, { method: "DELETE" });
}

export async function adminLogin(email: string, password: string): Promise<AdminSession> {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) || "Invalid email or password");
  }
  const session: AdminSession = { token: data.token, role: data.role, name: data.name };
  setAdminSession(session);
  return session;
}
