import { expect, test } from "@playwright/test";
import { createAccount } from "./support/api.ts";

test("main links live in the top bar on desktop and in the menu sheet on phones", async ({
  page,
  isMobile,
}) => {
  const account = await createAccount();
  await page.goto("/login");
  await page.getByLabel("Email").fill(account.email);
  await page.getByLabel("Password", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL("/");

  if (isMobile) {
    await page.getByRole("button", { name: "Buka menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Titipan" }).click();
    await expect(page.getByRole("dialog")).toBeHidden();
  } else {
    await expect(page.getByRole("button", { name: "Buka menu" })).toBeHidden();
    await page.getByRole("banner").getByRole("link", { name: "Titipan" }).click();
  }
  await expect(page).toHaveURL("/orders");
});
