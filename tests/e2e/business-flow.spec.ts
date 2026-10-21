import { expect, test, type Page } from "@playwright/test";

const apiBaseURL = process.env.E2E_API_URL ?? "http://127.0.0.1:8080";
const adminEmail = process.env.E2E_ADMIN_EMAIL ?? "admin@titipdong.test";
const adminPassword = process.env.E2E_ADMIN_PASSWORD ?? "demo12345";
const tinyPng = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/pN8AAAAASUVORK5CYII=",
  "base64",
);

const imageFile = (name: string) => ({ name, mimeType: "image/png", buffer: tinyPng });

function dateAfter(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

async function register(page: Page, name: string, role: "buyer" | "jastiper") {
  await page.goto("/register");
  if (role === "jastiper") {
    await page.locator('input[name="role"][value="jastiper"]').check({ force: true });
  }
  await page.getByLabel("Nama", { exact: true }).fill(name);
  await page.getByLabel("Email", { exact: true }).fill(`${role}.${Date.now()}@example.test`);
  await page.getByLabel("Password", { exact: true }).fill("e2e-password-123");
  await page.getByRole("button", { name: "Daftar" }).click();
  await expect(page).toHaveURL(role === "jastiper" ? /\/my-trips$/ : /\/trips$/);
}

async function createTrip(page: Page, title: string) {
  await page.goto("/my-trips/new");
  await page.getByLabel("Judul trip").fill(title);
  await page.getByLabel("Kota tujuan").fill("Tokyo");
  await page.getByLabel("Negara").selectOption("JP");
  await page.getByLabel("Tanggal berangkat").fill(dateAfter(7));
  await page.getByLabel("Tanggal pulang").fill(dateAfter(35));
  await page.getByLabel("Batas titip").fill(`${dateAfter(4)}T23:00`);
  await page.getByLabel("Kapasitas barang").fill("20");

  const responsePromise = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" && new URL(response.url()).pathname.endsWith("/trips"),
  );
  await page.getByRole("button", { name: "Buka trip", exact: true }).click();
  const response = await responsePromise;
  expect(response.ok()).toBeTruthy();
  const trip = (await response.json()) as { id: string; slug: string };
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  return trip;
}

async function approveOrder(page: Page, orderId: string) {
  await page.goto(`/orders/${orderId}`);
  await page.getByLabel("Harga barang per unit (Rp)").fill("50000");
  await page.getByLabel("Fee jastip untuk seluruh titipan (Rp)").fill("10000");
  await page.getByRole("button", { name: "Setujui titipan" }).click();
  await expect(page.getByText("Menunggu pembayaran").first()).toBeVisible();
}

async function payOrder(page: Page, orderId: string) {
  await page.goto(`/orders/${orderId}/pay`);
  await page.getByRole("button", { name: /Bayar Rp/ }).click();
  await expect(page).toHaveURL(new RegExp(`/orders/${orderId}$`));
  await expect(page.locator('[data-status="paid"]')).toBeVisible();
}

async function shipOrder(page: Page, orderId: string) {
  await page.goto(`/orders/${orderId}`);
  await page.getByLabel("Cara serah terima").selectOption("cod");
  await page.getByRole("button", { name: "Tandai sudah dikirim" }).click();
  await expect(page.locator('[data-status="shipped"]')).toBeVisible();
}

async function loginAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(adminEmail);
  await page.getByLabel("Password", { exact: true }).fill(adminPassword);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

test.beforeEach(async ({ request }) => {
  const url = new URL(apiBaseURL);
  if (!new Set(["localhost", "127.0.0.1"]).has(url.hostname)) {
    throw new Error("E2E tests are restricted to a local API; set E2E_API_URL to localhost.");
  }
  const ready = await request.get(`${apiBaseURL}/health/ready`);
  expect(ready.ok(), "Backend and database must be running for E2E tests").toBeTruthy();
});

test("buyer, jastiper, and admin complete trip, payment, payout, and dispute workflows", async ({
  browser,
}) => {
  const stamp = Date.now();
  const buyerContext = await browser.newContext();
  const jastiperContext = await browser.newContext();
  const adminContext = await browser.newContext();
  const buyer = await buyerContext.newPage();
  const jastiper = await jastiperContext.newPage();
  const admin = await adminContext.newPage();
  const jastiperName = `E2E Jastiper ${stamp}`;

  try {
    await register(jastiper, jastiperName, "jastiper");

    // The recently added profile editor saves name and phone to the backend.
    await jastiper.goto("/profile");
    await jastiper.getByLabel("Nama", { exact: true }).fill(jastiperName);
    await jastiper.getByLabel("Nomor telepon").fill("+628123456789");
    await jastiper.getByRole("button", { name: "Simpan profil" }).click();
    await expect(jastiper.getByText("Profil berhasil diperbarui.")).toBeVisible();

    const tripTitle = `E2E Tokyo ${stamp}`;
    const trip = await createTrip(jastiper, tripTitle);

    // Exercise the new catalog management route and public trip detail display.
    await jastiper.goto(`/my-trips/${trip.id}/catalog`);
    const catalogItemName = `E2E Souvenir ${stamp}`;
    await jastiper.getByLabel("Nama barang").fill(catalogItemName);
    await jastiper.getByLabel("Deskripsi").fill("Demo item created by browser test");
    await jastiper.getByLabel("Harga referensi (opsional)").fill("45000");
    await jastiper.getByLabel("Foto barang").setInputFiles(imageFile("catalog.png"));
    await jastiper.getByRole("button", { name: "Tambahkan ke katalog" }).click();
    await expect(jastiper.getByRole("heading", { name: catalogItemName })).toBeVisible();
    await expect(jastiper.getByRole("img", { name: catalogItemName })).toBeVisible();

    const updatedTripTitle = `${tripTitle} updated`;
    await jastiper.goto(`/my-trips/${trip.id}/edit`);
    await jastiper.getByLabel("Nama trip").fill(updatedTripTitle);
    await jastiper.getByRole("button", { name: "Simpan perubahan" }).click();
    await expect(jastiper).toHaveURL(/\/my-trips$/);

    await register(buyer, `E2E Buyer ${stamp}`, "buyer");
    await buyer.goto(`/trip/${trip.slug}`);
    await expect(buyer.getByRole("heading", { name: updatedTripTitle })).toBeVisible();
    await expect(buyer.getByRole("heading", { name: `E2E Souvenir ${stamp}` })).toBeVisible();
    await buyer.goto(`/trip/${trip.slug}/request`);
    await expect(buyer.getByRole("heading", { name: "Titip barang" })).toBeVisible();
    await buyer.getByLabel("Nama barang").fill(`E2E Item ${stamp}`);
    await buyer.getByLabel("Jumlah").fill("2");
    await buyer.getByLabel("Foto barang (opsional)").setInputFiles(imageFile("order.png"));
    await buyer.getByLabel("Catatan (opsional)").fill("Browser E2E request");
    await buyer.getByRole("button", { name: "Kirim titipan" }).click();
    await expect(buyer).toHaveURL(/\/orders\/[0-9a-f-]+$/i);
    const orderId = new URL(buyer.url()).pathname.split("/").at(-1)!;
    await expect(buyer.locator('[data-status="requested"]')).toBeVisible();

    await approveOrder(jastiper, orderId);
    await payOrder(buyer, orderId);
    await shipOrder(jastiper, orderId);

    // Receive, release escrow, and check notification/read state.
    await buyer.goto(`/orders/${orderId}`);
    await expect(buyer.getByRole("img", { name: `E2E Item ${stamp}` })).toBeVisible();
    buyer.once("dialog", (dialog) => void dialog.accept());
    await buyer.getByRole("button", { name: "Barang sudah diterima" }).click();
    await expect(buyer.locator('[data-status="released"]')).toBeVisible();
    await buyer.goto("/notifications");
    await expect(buyer.getByRole("heading", { name: "Notifikasi" })).toBeVisible();
    await buyer.getByRole("button", { name: "Tandai semua dibaca" }).click();
    await expect(buyer.getByText("Dibaca").first()).toBeVisible();

    // Exercise payout account, request, admin queue decision, and ledger view.
    await jastiper.goto("/wallet");
    await jastiper.getByLabel("Nama bank").fill("Bank E2E");
    await jastiper.getByLabel("Nomor rekening").fill("1234567890");
    await jastiper.getByLabel("Nama pemilik rekening").fill(jastiperName);
    await jastiper.getByRole("button", { name: "Simpan rekening" }).click();
    await expect(jastiper.getByText("Rekening pencairan tersimpan.")).toBeVisible();
    await jastiper.getByLabel("Nominal (rupiah)").fill("30000");
    await jastiper.getByRole("button", { name: "Ajukan pencairan" }).click();
    await expect(jastiper.getByText("Permintaan pencairan dikirim ke admin.")).toBeVisible();

    await loginAdmin(admin);
    await admin.goto("/admin");
    await expect(admin.getByRole("heading", { name: "Dashboard admin" })).toBeVisible();
    await admin.goto("/admin/payouts");
    await expect(admin.getByRole("heading", { name: "Payout jastiper" })).toBeVisible();
    await admin.getByLabel(`Referensi transfer untuk ${jastiperName}`).fill(`E2E-${stamp}`);
    await admin.getByRole("button", { name: "Tandai dibayar" }).click();
    await expect(admin.getByText("Payout ditandai sudah dibayar.")).toBeVisible();
    await admin.goto("/admin/transactions");
    await expect(admin.getByRole("heading", { name: "Transaksi" })).toBeVisible();
    await admin.goto("/admin/users");
    await expect(admin.getByRole("heading", { name: "Pengguna" })).toBeVisible();
    await admin.goto("/admin/audit");
    await expect(admin.getByRole("heading", { name: "Audit log" })).toBeVisible();

    // Run a second order through the dispute form and newly implemented admin queue.
    await buyer.goto(`/trip/${trip.slug}/request`);
    await buyer.getByLabel("Nama barang").fill(`E2E Dispute Item ${stamp}`);
    await buyer.getByLabel("Jumlah").fill("1");
    await buyer.getByRole("button", { name: "Kirim titipan" }).click();
    await expect(buyer).toHaveURL(/\/orders\/[0-9a-f-]+$/i);
    const disputedOrderId = new URL(buyer.url()).pathname.split("/").at(-1)!;

    await approveOrder(jastiper, disputedOrderId);
    await payOrder(buyer, disputedOrderId);
    await shipOrder(jastiper, disputedOrderId);
    await buyer.goto(`/orders/${disputedOrderId}`);
    await buyer.getByRole("link", { name: "Ajukan sengketa" }).click();
    await buyer.getByLabel("Jenis masalah").selectOption("not_as_described");
    await buyer
      .getByLabel("Ceritakan masalahnya")
      .fill("E2E: barang yang diterima berbeda dari deskripsi.");
    await buyer.getByRole("button", { name: "Kirim sengketa" }).click();
    await expect(buyer).toHaveURL(new RegExp(`/orders/${disputedOrderId}$`));

    await admin.goto("/admin/disputes");
    await expect(admin.getByRole("heading", { name: "Sengketa" })).toBeVisible();
    await expect(admin.locator("ul button").first()).toBeVisible();
    await admin.locator("ul button").first().click();
    await expect(
      admin.getByText("E2E: barang yang diterima berbeda dari deskripsi."),
    ).toBeVisible();
    await admin.locator("select").selectOption("refund");
    await admin
      .getByPlaceholder("Catatan keputusan yang akan dilihat kedua pihak")
      .fill("E2E refund decision");
    await admin.getByRole("button", { name: "Tetapkan keputusan" }).click();
    await expect(admin.getByText("Sengketa diputuskan untuk refund.")).toBeVisible();
    await expect(admin.getByText("Belum ada sengketa terbuka.")).toBeVisible();

    await admin.goto("/admin/audit");
    await expect(admin.getByRole("heading", { name: "Audit log" })).toBeVisible();
  } finally {
    await buyerContext.close();
    await jastiperContext.close();
    await adminContext.close();
  }
});

test("Prometheus, Grafana, and Loki are connected to the local API", async ({ request }) => {
  const metrics = await request.get(`${apiBaseURL}/metrics`);
  expect(metrics.ok()).toBeTruthy();
  expect(await metrics.text()).toContain("http_server_requests_total");

  const prometheusURL = process.env.E2E_PROMETHEUS_URL ?? "http://127.0.0.1:9090";
  const targets = await request.get(`${prometheusURL}/api/v1/targets`);
  expect(targets.ok()).toBeTruthy();
  const targetBody = (await targets.json()) as {
    data: { activeTargets: { labels: { job: string }; health: string }[] };
  };
  expect(
    targetBody.data.activeTargets.some(
      (target) => target.labels.job === "titipdong-api-local" && target.health === "up",
    ),
  ).toBeTruthy();

  const grafanaURL = process.env.E2E_GRAFANA_URL ?? "http://127.0.0.1:3000";
  const health = await request.get(`${grafanaURL}/api/health`);
  expect(health.ok()).toBeTruthy();
  const username = process.env.E2E_GRAFANA_USER ?? "admin";
  const password = process.env.E2E_GRAFANA_PASSWORD ?? "admin";
  const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  const authHeaders = { Authorization: authorization };

  const sources = await request.get(`${grafanaURL}/api/datasources`, { headers: authHeaders });
  expect(sources.ok()).toBeTruthy();
  const sourceList = (await sources.json()) as { uid: string; type: string }[];
  expect(
    sourceList.some((source) => source.uid === "prometheus" && source.type === "prometheus"),
  ).toBeTruthy();
  expect(sourceList.some((source) => source.uid === "loki" && source.type === "loki")).toBeTruthy();

  const dashboard = await request.get(`${grafanaURL}/api/dashboards/uid/titipdong-api`, {
    headers: authHeaders,
  });
  expect(dashboard.ok()).toBeTruthy();

  const labels = await request.get(
    `${grafanaURL}/api/datasources/proxy/uid/loki/loki/api/v1/label/service/values`,
    { headers: authHeaders },
  );
  expect(labels.ok()).toBeTruthy();
  const labelBody = (await labels.json()) as { data: string[] };
  expect(labelBody.data).toContain("titipdong-api");
});

test("protected admin route redirects an unauthenticated visitor to login", async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Masuk" })).toBeVisible();
  } finally {
    await context.close();
  }
});
