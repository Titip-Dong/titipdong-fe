import { expect, test, type Page } from "@playwright/test";
import {
  approveOrder,
  confirmReceipt,
  createAccount,
  createOrder,
  createTrip,
  demo,
  readOrderDispute,
  payOrder,
  readWallet,
  shipOrder,
} from "./support/api.ts";

const evidenceImage = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function signIn(page: Page, email: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL((url) => url.pathname !== "/login");
}

test("buyer and jastiper complete request, mock payment, shipment, and receipt", async ({
  browser,
}) => {
  // This journey performs two logins and several backend state transitions; allow CI-like parallel load.
  test.setTimeout(60_000);
  const buyer = await createAccount("buyer");
  const jastiper = await createAccount("jastiper");
  const trip = await createTrip(jastiper.token);
  const buyerPage = await browser.newPage();
  const jastiperPage = await browser.newPage();

  await signIn(buyerPage, buyer.email, buyer.password);
  await buyerPage.goto(`/trip/${trip.slug}/request`);
  await buyerPage.getByLabel("Nama barang").fill("QA end-to-end headphones");
  await buyerPage.getByLabel("Jumlah").fill("1");
  await buyerPage.getByRole("button", { name: "Kirim titipan" }).click();
  await expect(buyerPage).toHaveURL(/\/orders\/[0-9a-f-]+$/);
  const orderUrl = new URL(buyerPage.url());
  const orderId = orderUrl.pathname.split("/").at(-1)!;
  await expect(buyerPage.getByText("Menunggu persetujuan")).toBeVisible();

  await signIn(jastiperPage, jastiper.email, jastiper.password);
  await jastiperPage.goto(`/orders/${orderId}`);
  await jastiperPage.getByLabel("Harga barang per unit (Rp)").fill("175000");
  await jastiperPage.getByLabel("Fee jastip untuk seluruh titipan (Rp)").fill("25000");
  await jastiperPage.getByRole("button", { name: "Setujui titipan" }).click();
  await expect(jastiperPage.getByText("Menunggu pembayaran")).toBeVisible();

  await buyerPage.goto(`/orders/${orderId}`);
  await buyerPage.getByRole("link", { name: "Bayar sekarang" }).click();
  await buyerPage.getByRole("button", { name: /^Bayar / }).click();
  await expect(buyerPage).toHaveURL(`/orders/${orderId}`);
  await expect(buyerPage.getByText("Dibayar, dana ditahan", { exact: true })).toBeVisible();

  await jastiperPage.goto(`/orders/${orderId}`);
  await jastiperPage.getByLabel("Cara serah terima").selectOption("courier");
  await jastiperPage.getByLabel("Kurir").selectOption("jne");
  await jastiperPage.getByLabel("Nomor resi").fill(`QA-${Date.now()}`);
  await jastiperPage.getByRole("button", { name: "Tandai sudah dikirim" }).click();
  await expect(jastiperPage.getByText("Dikirim", { exact: true })).toBeVisible();

  await buyerPage.goto(`/orders/${orderId}`);
  await buyerPage.getByRole("button", { name: "Barang sudah diterima" }).click();
  await buyerPage.getByRole("dialog").getByRole("button", { name: "Ya, barang diterima" }).click();
  await expect(buyerPage.getByText("Dana dicairkan")).toBeVisible();

  await jastiperPage.goto("/wallet");
  await expect(jastiperPage.getByText("Saldo pendapatan")).toBeVisible();
  await expect(
    jastiperPage
      .locator("article")
      .filter({ hasText: "Saldo pendapatan" })
      .getByText(/190\.000/),
  ).toBeVisible();
  await buyerPage.close();
  await jastiperPage.close();
});

test("buyer opens a dispute, both parties message, and admin refunds it", async ({ browser }) => {
  const buyer = await createAccount("buyer");
  const jastiper = await createAccount("jastiper");
  const trip = await createTrip(jastiper.token);
  const order = await createOrder(buyer.token, trip.slug, "QA disputed package");
  await approveOrder(jastiper.token, order.id);
  await payOrder(buyer.token, order.id);
  await shipOrder(jastiper.token, order.id);
  const buyerPage = await browser.newPage();
  const adminPage = await browser.newPage();

  await signIn(buyerPage, buyer.email, buyer.password);
  await buyerPage.goto(`/orders/${order.id}/dispute`);
  await buyerPage.getByLabel("Masalah yang terjadi").selectOption("damaged");
  await buyerPage
    .getByLabel("Ceritakan masalahnya")
    .fill("Barang sampai dalam keadaan rusak. Mohon ditinjau.");
  await buyerPage.getByRole("button", { name: "Kirim sengketa" }).click();
  await expect(buyerPage).toHaveURL(`/orders/${order.id}`);
  await expect(buyerPage.getByText("Dalam sengketa")).toBeVisible();
  const dispute = await readOrderDispute(buyer.token, order.id);
  await buyerPage.getByLabel("Tulis pesan").fill("Saya sudah menambahkan rincian kerusakannya.");
  await buyerPage.getByRole("button", { name: "Kirim pesan" }).click();
  await expect(buyerPage.getByText("Saya sudah menambahkan rincian kerusakannya.")).toBeVisible();

  await signIn(adminPage, demo.admin.email, demo.admin.password);
  await adminPage.goto("/admin/disputes");
  await expect(adminPage.getByRole("heading", { name: "Sengketa" })).toBeVisible();
  await adminPage.goto(`/admin/disputes/${dispute.id}`);
  await expect(adminPage.getByText("Barang sampai dalam keadaan rusak.")).toBeVisible();
  await adminPage.getByLabel("Tulis pesan").fill("Bukti sudah ditinjau.");
  await adminPage.getByRole("button", { name: "Kirim pesan" }).click();
  await adminPage
    .getByLabel("Catatan keputusan")
    .fill("Bukti mendukung klaim kerusakan; refund penuh disetujui.");
  await adminPage.getByRole("button", { name: "Refund pembeli" }).click();
  await adminPage.getByRole("dialog").getByRole("button", { name: "Ya, refund" }).click();
  await expect(adminPage).toHaveURL("/admin/disputes");

  await buyerPage.goto(`/orders/${order.id}`);
  await expect(buyerPage.locator('[data-status="refunded"]')).toBeVisible();
  await buyerPage.goto("/notifications");
  await expect(buyerPage.getByText(/Sengketa/).first()).toBeVisible();
  await buyerPage.getByRole("button", { name: "Tandai semua dibaca" }).click();
  await expect(buyerPage.getByRole("button", { name: "Tandai semua dibaca" })).toBeDisabled();
  await buyerPage.close();
  await adminPage.close();
});

test("buyer submits dispute evidence and admin releases the held funds", async ({ browser }) => {
  test.setTimeout(60_000);
  const buyer = await createAccount("buyer");
  const jastiper = await createAccount("jastiper");
  const trip = await createTrip(jastiper.token);
  const order = await createOrder(buyer.token, trip.slug, "QA evidence package");
  await approveOrder(jastiper.token, order.id);
  await payOrder(buyer.token, order.id);
  await shipOrder(jastiper.token, order.id);
  const buyerPage = await browser.newPage();
  const adminPage = await browser.newPage();

  await signIn(buyerPage, buyer.email, buyer.password);
  await buyerPage.goto(`/orders/${order.id}/dispute`);
  await buyerPage.getByLabel("Masalah yang terjadi").selectOption("not_as_described");
  await buyerPage.getByLabel("Ceritakan masalahnya").fill("Warna barang berbeda dari pesanan.");
  await buyerPage.getByLabel("Foto bukti (opsional, maksimal 5)").setInputFiles({
    name: "evidence.png",
    mimeType: "image/png",
    buffer: evidenceImage,
  });
  await buyerPage.getByRole("button", { name: "Kirim sengketa" }).click();
  await expect(buyerPage).toHaveURL(`/orders/${order.id}`);

  const dispute = await readOrderDispute(buyer.token, order.id);
  await signIn(adminPage, demo.admin.email, demo.admin.password);
  await adminPage.goto(`/admin/disputes/${dispute.id}`);
  await expect(adminPage.getByRole("img", { name: /Bukti dari/ })).toBeVisible();
  await adminPage
    .getByLabel("Catatan keputusan")
    .fill("Barang sesuai deskripsi dan bukti pengiriman valid.");
  await adminPage.getByRole("button", { name: "Teruskan dana" }).click();
  await adminPage.getByRole("dialog").getByRole("button", { name: "Ya, teruskan dana" }).click();
  await expect(adminPage).toHaveURL("/admin/disputes");
  await buyerPage.goto(`/orders/${order.id}`);
  await expect(buyerPage.getByText("Dana dicairkan", { exact: true })).toBeVisible();
  await buyerPage.close();
  await adminPage.close();
});

test("jastiper requests a payout and admin processes it and reviews back office", async ({
  browser,
}) => {
  const buyer = await createAccount("buyer");
  const jastiper = await createAccount("jastiper");
  const trip = await createTrip(jastiper.token);
  const order = await createOrder(buyer.token, trip.slug, "QA payout order");
  await approveOrder(jastiper.token, order.id);
  await payOrder(buyer.token, order.id);
  await shipOrder(jastiper.token, order.id);
  await confirmReceipt(buyer.token, order.id);
  const wallet = await readWallet(jastiper.token);
  const buyerPage = await browser.newPage();
  const adminPage = await browser.newPage();

  await signIn(buyerPage, jastiper.email, jastiper.password);
  await buyerPage.goto("/wallet");
  await buyerPage.getByLabel("Nama bank").fill("Bank QA");
  await buyerPage.getByLabel("Nomor rekening").fill("123456789012");
  await buyerPage.getByLabel("Nama pemilik rekening").fill("QA Jastiper");
  await buyerPage.getByRole("button", { name: "Simpan rekening" }).click();
  await expect(buyerPage.getByText("Rekening pencairan tersimpan.")).toBeVisible();
  await buyerPage.getByLabel("Nominal (rupiah)").fill(String(wallet.available));
  await buyerPage.getByRole("button", { name: "Ajukan pencairan" }).click();
  await expect(buyerPage.getByText("Permintaan pencairan dikirim ke admin.")).toBeVisible();
  await expect(buyerPage.getByText("requested", { exact: true })).toBeVisible();

  await signIn(adminPage, demo.admin.email, demo.admin.password);
  await adminPage.goto("/admin/payouts");
  const payout = adminPage.locator("article").filter({ hasText: "123456789012" });
  await payout.getByLabel("Referensi transfer").fill("QA-TRANSFER-001");
  await payout.getByRole("button", { name: "Tandai dibayar" }).click();
  await adminPage.getByRole("dialog").getByRole("button", { name: "Sudah ditransfer" }).click();
  await expect(adminPage.getByText("Payout ditandai sudah dibayar.")).toBeVisible();

  for (const route of [
    "/admin",
    "/admin/orders",
    "/admin/transactions",
    "/admin/users",
    "/admin/audit",
  ]) {
    await adminPage.goto(route);
    await expect(adminPage.getByRole("main").getByRole("heading").first()).toBeVisible();
  }
  await buyerPage.close();
  await adminPage.close();
});

test("admin can suspend and reactivate an account from the user list", async ({ browser }) => {
  const buyer = await createAccount("buyer");
  const adminPage = await browser.newPage();
  await signIn(adminPage, demo.admin.email, demo.admin.password);
  await adminPage.goto("/admin/users");
  await adminPage.getByLabel("Cari nama atau email").fill(buyer.email);
  const row = adminPage.getByRole("row").filter({ hasText: buyer.email });
  await expect(row).toContainText("Aktif");
  await row.getByRole("button", { name: "Nonaktifkan" }).click();
  await adminPage.getByRole("dialog").getByRole("button", { name: "Nonaktifkan" }).click();
  await expect(adminPage.getByText("Status akun diperbarui.")).toBeVisible();
  await expect(row).toContainText("Dinonaktifkan");
  await row.getByRole("button", { name: "Aktifkan" }).click();
  await adminPage.getByRole("dialog").getByRole("button", { name: "Aktifkan" }).click();
  await expect(row).toContainText("Aktif");
  await adminPage.close();
});
