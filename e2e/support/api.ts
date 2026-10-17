import { randomUUID } from "node:crypto";

// Direct backend calls for test setup, so specs only drive the UI they are testing.
export const API_URL = process.env.API_URL ?? "http://localhost:8080";

/** Demo accounts from `make seed` in titipdong-be. */
export const demo = {
  buyer: { email: "buyer@titipdong.test", password: "demo12345" },
  jastiper: { email: "jastiper@titipdong.test", password: "demo12345" },
  admin: { email: "admin@titipdong.test", password: "demo12345" },
};

export interface TestAccount {
  id: string;
  name: string;
  email: string;
  password: string;
  token: string;
}

async function call<T>(path: string, init: RequestInit = {}, token?: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });
  if (!res.ok) throw new Error(`${init.method ?? "GET"} ${path} failed with ${res.status}`);
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** A fresh account per test, so tests can change passwords or get suspended without affecting others. */
export async function createAccount(role: "buyer" | "jastiper" = "buyer"): Promise<TestAccount> {
  const suffix = randomUUID().slice(0, 8);
  const account = {
    name: `QA ${suffix}`,
    email: `qa-${suffix}@titipdong.test`,
    password: `qa-${randomUUID()}`,
    role,
  };
  const res = await call<{ accessToken: string; user: { id: string } }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(account),
  });
  return { ...account, id: res.user.id, token: res.accessToken };
}

export async function login(email: string, password: string): Promise<string> {
  const res = await call<{ accessToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.accessToken;
}

export async function setUserStatus(userId: string, status: "active" | "suspended") {
  const adminToken = await login(demo.admin.email, demo.admin.password);
  await call(
    `/admin/users/${userId}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    adminToken,
  );
}
