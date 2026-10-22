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

export interface TestTrip {
  id: string;
  slug: string;
  title: string;
  destinationCity: string;
}

const day = 24 * 60 * 60 * 1000;
const isoDate = (offsetDays: number) =>
  new Date(Date.now() + offsetDays * day).toISOString().slice(0, 10);

/** An open trip that departs tomorrow; the city gets a unique suffix so list filters find only this trip. */
export async function createTrip(token: string, overrides: Partial<Record<string, unknown>> = {}) {
  const suffix = randomUUID().slice(0, 6);
  return call<TestTrip>(
    "/trips",
    {
      method: "POST",
      body: JSON.stringify({
        title: `Jastip QA ${suffix}`,
        destinationCity: `Qacity${suffix}`,
        destinationCountry: "JP",
        departsOn: isoDate(1),
        returnsOn: isoDate(10),
        requestDeadline: new Date(Date.now() + 3 * day).toISOString(),
        capacity: 10,
        ...overrides,
      }),
    },
    token,
  );
}

export async function addItem(
  token: string,
  tripId: string,
  name: string,
  referencePrice?: number,
) {
  await call(
    `/trips/${tripId}/items`,
    { method: "POST", body: JSON.stringify({ name, referencePrice }) },
    token,
  );
}

export async function createOrder(token: string, slug: string, productName = "QA order") {
  return call<{ id: string; code: string }>(
    `/trips/${slug}/orders`,
    { method: "POST", body: JSON.stringify({ productName, quantity: 1 }) },
    token,
  );
}

export async function approveOrder(token: string, orderId: string) {
  return call(
    `/orders/${orderId}/approve`,
    {
      method: "POST",
      body: JSON.stringify({ itemPrice: 100_000, jastipFee: 10_000 }),
    },
    token,
  );
}

export async function payOrder(token: string, orderId: string) {
  const payment = await call<{ id: string }>(
    `/orders/${orderId}/payments`,
    { method: "POST" },
    token,
  );
  await call(`/payments/${payment.id}/simulate`, { method: "POST" }, token);
}

export async function shipOrder(token: string, orderId: string) {
  await call(
    `/orders/${orderId}/shipment`,
    {
      method: "PUT",
      body: JSON.stringify({
        method: "courier",
        courierCode: "jne",
        trackingNumber: `QA${Date.now()}`,
      }),
    },
    token,
  );
}

export async function confirmReceipt(token: string, orderId: string) {
  await call(`/orders/${orderId}/confirm-receipt`, { method: "POST" }, token);
}

export async function readWallet(token: string) {
  return call<{ balance: number; available: number; inEscrow: number; pendingPayout: number }>(
    "/wallet",
    {},
    token,
  );
}

export async function readOrderDispute(token: string, orderId: string) {
  return call<{ id: string }>(`/orders/${orderId}/dispute`, {}, token);
}
