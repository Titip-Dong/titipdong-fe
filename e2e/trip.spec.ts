import { expect, test, type Page } from "@playwright/test";
import { addItem, createAccount, createTrip, type TestAccount } from "./support/api.ts";

// A 1x1 PNG, enough for a real upload to Azurite through the photo field.
const pixel = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function signIn(page: Page, account: TestAccount) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL((url) => url.pathname !== "/login");
}

const localDateTime = (offsetDays: number) => {
  const d = new Date(Date.now() + offsetDays * 86_400_000);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
};

test("a jastiper opens a trip and fills the catalog with a photo", async ({ page }) => {
  const jastiper = await createAccount("jastiper");
  await signIn(page, jastiper);
  await page.goto("/my-trips/new");
  await page.getByLabel("Judul trip").fill("Jastip Tokyo QA");
  await page.getByLabel("Kota tujuan").fill("Tokyo");
  await page.getByLabel("Negara").selectOption("JP");
  await page.getByLabel("Tanggal berangkat").fill(localDateTime(2).slice(0, 10));
  await page.getByLabel("Tanggal pulang").fill(localDateTime(9).slice(0, 10));
  await page.getByLabel("Batas titip").fill(localDateTime(3));
  await page.getByLabel("Kapasitas (barang)").fill("12");
  await page.getByRole("button", { name: "Buka trip" }).click();

  await expect(page.getByRole("heading", { name: "Jastip Tokyo QA" })).toBeVisible();
  await expect(page.getByText("Katalog masih kosong")).toBeVisible();

  await page.getByRole("button", { name: "Tambah barang" }).click();
  const sheet = page.getByRole("dialog");
  await sheet
    .locator('input[type="file"]')
    .setInputFiles({ name: "banana.png", mimeType: "image/png", buffer: pixel });
  await expect(sheet.getByRole("button", { name: "Ganti foto" })).toBeVisible();
  await sheet.getByLabel("Nama barang").fill("Tokyo Banana isi 8");
  await sheet.getByLabel("Harga perkiraan (opsional)").fill("145000");
  await sheet.getByRole("button", { name: "Tambah ke katalog" }).click();

  await expect(sheet).toBeHidden();
  const row = page.getByRole("listitem").filter({ hasText: "Tokyo Banana isi 8" });
  await expect(row.getByText("Sekitar Rp 145.000")).toBeVisible();
  await expect(row.getByRole("img", { name: "Tokyo Banana isi 8" })).toHaveAttribute(
    "src",
    /blob|http/,
  );
});

test("the trip list shows catalog photos, with a fallback for an empty catalog", async ({
  page,
}) => {
  const jastiper = await createAccount("jastiper");
  const withItems = await createTrip(jastiper.token);
  await addItem(jastiper.token, withItems.id, "Pocky Matcha", 60000);
  const empty = await createTrip(jastiper.token);

  await page.goto(`/trips?city=${withItems.destinationCity}`);
  await expect(page.getByRole("img", { name: "Pocky Matcha" })).toBeVisible();

  await page.goto(`/trips?city=${empty.destinationCity}`);
  await expect(page.getByText("Katalog belum diisi")).toBeVisible();

  await page.goto("/trips?city=kota-yang-tidak-ada");
  await expect(page.getByRole("heading", { name: "Belum ada trip yang cocok" })).toBeVisible();
});

test("trip detail invites visitors to log in and buyers to request", async ({ page }) => {
  const jastiper = await createAccount("jastiper");
  const trip = await createTrip(jastiper.token);
  await addItem(jastiper.token, trip.id, "Tokyo Banana", 145000);

  await page.goto(`/trip/${trip.slug}`);
  await expect(page.getByRole("heading", { name: trip.title })).toBeVisible();
  await expect(page.getByText("Tokyo Banana")).toBeVisible();
  await expect(page.getByRole("link", { name: "Masuk untuk titip" })).toBeVisible();

  await signIn(page, await createAccount("buyer"));
  await page.goto(`/trip/${trip.slug}`);
  await expect(page.getByRole("link", { name: "Titip barang" })).toBeVisible();
});

test("a jastiper edits, closes, and cancels a trip", async ({ page }) => {
  const jastiper = await createAccount("jastiper");
  const trip = await createTrip(jastiper.token);
  await signIn(page, jastiper);

  await page.goto(`/my-trips/${trip.slug}/edit`);
  await page.getByLabel("Judul trip").fill("Judul baru QA");
  await page.getByRole("button", { name: "Simpan trip" }).click();
  await expect(page.getByRole("heading", { name: "Judul baru QA" })).toBeVisible();

  await page.getByRole("button", { name: "Tutup trip" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Tutup trip" }).click();
  await expect(page.getByText("Ditutup", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ubah trip" })).toBeHidden();

  await page.getByRole("button", { name: "Batalkan trip" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Batalkan trip" }).click();
  await expect(page.getByText("Dibatalkan", { exact: true })).toBeVisible();
});

test("another jastiper cannot manage someone else's trip", async ({ page }) => {
  const owner = await createAccount("jastiper");
  const trip = await createTrip(owner.token);
  await signIn(page, await createAccount("jastiper"));
  await page.goto(`/my-trips/${trip.slug}`);
  await expect(page.getByRole("heading", { name: "Trip ini nggak ketemu" })).toBeVisible();
});

test("typing a city filters the list without pressing a button", async ({ page }) => {
  const jastiper = await createAccount("jastiper");
  const trip = await createTrip(jastiper.token);
  await page.goto("/trips");
  await page.getByLabel("Kota tujuan").fill(trip.destinationCity);
  await expect(page).toHaveURL(new RegExp(`city=${trip.destinationCity}`));
  await expect(
    page.getByRole("heading", { name: `Trip ke ${trip.destinationCity}` }),
  ).toBeVisible();
  await expect(page.getByText(trip.title)).toBeVisible();
});

test("scrolling to the end loads the next page of trips", async ({ page }) => {
  const jastiper = await createAccount("jastiper");
  const city = `Qascroll${Date.now().toString(36)}`;
  await Promise.all(
    Array.from({ length: 22 }, () => createTrip(jastiper.token, { destinationCity: city })),
  );

  await page.goto(`/trips?city=${city}`);
  const cards = page.getByRole("main").getByRole("listitem");
  await expect(cards).toHaveCount(20);
  await cards.last().scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 4000);
  await expect(cards).toHaveCount(22);
});
