import { env } from "@/lib/env";
import { useAuthStore } from "@/stores/auth";
import type { AuthResponse } from "./generated/model";

/**
 * Error returned by the backend. Huma uses RFC 9457 (`application/problem+json`),
 * so error details can be read from `body` and shown in a toast or form.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

let refreshing: Promise<boolean> | null = null;

/**
 * Requests a new access token using the refresh token in the HttpOnly cookie.
 * Concurrent requests that all hit 401 share the same in-flight promise.
 */
export async function refreshAccessToken(): Promise<boolean> {
  // Plain fetch, not the generated refreshSession: that goes through apiFetch and would recurse on 401.
  refreshing ??= fetch(`${env.VITE_API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const { accessToken, user } = (await res.json()) as AuthResponse;
      useAuthStore.getState().setSession(accessToken, user);
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

/** orval mutator: every API request goes through this function. */
export async function apiFetch<T>(url: string, init: RequestInit = {}): Promise<T> {
  const send = () => {
    const token = useAuthStore.getState().accessToken;
    const headers = new Headers(init.headers);
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return fetch(`${env.VITE_API_URL}${url}`, { ...init, headers, credentials: "include" });
  };

  let res = await send();
  if (res.status === 401) {
    // Only a failed refresh ends the session. A 401 after a successful refresh is a regular error
    // (e.g. a wrong current password on PATCH /me) and goes to the caller.
    if (await refreshAccessToken()) res = await send();
    else useAuthStore.getState().clear();
  }

  const body = [204, 205, 304].includes(res.status)
    ? undefined
    : await res.json().catch(() => undefined);
  if (!res.ok) throw new ApiError(res.status, body);
  return body as T;
}
