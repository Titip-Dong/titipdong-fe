import { expect, test } from "@playwright/test";

test("home page loads with the navbar", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("img", { name: "TITIP DONG" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Masuk" })).toBeVisible();
});

test("unknown routes show the not-found state", async ({ page }) => {
  await page.goto("/halaman-yang-tidak-ada");
  await expect(page.getByRole("heading", { name: "Halamannya nggak ketemu" })).toBeVisible();
  await page.getByRole("link", { name: "Kembali ke beranda" }).click();
  await expect(page).toHaveURL("/");
});
