import { expect, test, type Page } from "@playwright/test";
import { createAccount, setUserStatus, type TestAccount } from "./support/api.ts";

async function fillLogin(page: Page, email: string, password: string) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
}

test.describe("register", () => {
  test("a new jastiper lands on their trips", async ({ page }) => {
    const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await page.goto("/register");
    await page.getByText("Jastiper", { exact: true }).click();
    await page.getByLabel("Nama").fill("QA Jastiper");
    await page.getByLabel("Email").fill(`qa-${suffix}@titipdong.test`);
    await page.getByLabel("Password", { exact: true }).fill("rahasia-qa-123");
    await page.getByRole("button", { name: "Buat akun" }).click();
    await expect(page).toHaveURL("/my-trips");
  });

  test("shows field errors before sending", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("button", { name: "Buat akun" }).click();
    await expect(page.getByLabel("Nama")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByLabel("Password", { exact: true })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });

  test("explains an email that is already registered", async ({ page }) => {
    const existing = await createAccount();
    await page.goto("/register");
    await page.getByLabel("Nama").fill("QA Kembar");
    await page.getByLabel("Email").fill(existing.email);
    await page.getByLabel("Password", { exact: true }).fill("rahasia-qa-123");
    await page.getByRole("button", { name: "Buat akun" }).click();
    await expect(page.getByText("Email ini sudah terdaftar")).toBeVisible();
  });
});

test.describe("login", () => {
  test("wrong password shows a fix, not a crash", async ({ page }) => {
    const account = await createAccount();
    await page.goto("/login");
    await fillLogin(page, account.email, "password-salah");
    await expect(page.getByText("Email atau password salah")).toBeVisible();
  });

  test("returns to the guarded page the user came from", async ({ page }) => {
    const account = await createAccount();
    await page.goto("/profile");
    await expect(page).toHaveURL("/login");
    await fillLogin(page, account.email, account.password);
    await expect(page).toHaveURL("/profile");
    await expect(page.getByText(account.email)).toBeVisible();
  });

  test("a suspended account is told why it cannot log in", async ({ page }) => {
    const account = await createAccount();
    await setUserStatus(account.id, "suspended");
    await page.goto("/login");
    await fillLogin(page, account.email, account.password);
    await expect(page.getByText("Akun ini sedang dinonaktifkan")).toBeVisible();
  });
});

const profileTest = test.extend<{ account: TestAccount }>({
  account: async ({ page }, use) => {
    const account = await createAccount();
    await page.goto("/login");
    await fillLogin(page, account.email, account.password);
    await expect(page).toHaveURL("/");
    await page.goto("/profile");
    await use(account);
  },
});

profileTest.describe("profile", () => {
  profileTest("updates name and phone", async ({ page, account }) => {
    await expect(page.getByText(account.email)).toBeVisible();
    await page.getByLabel("Nama").fill("QA Baru");
    await page.getByLabel("Nomor HP (opsional)").fill("081234567890");
    await page.getByRole("button", { name: "Simpan data diri" }).click();
    await expect(page.getByText("Data diri disimpan.")).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Nama")).toHaveValue("QA Baru");
    await expect(page.getByLabel("Nomor HP (opsional)")).toHaveValue("081234567890");
  });

  profileTest("rejects a phone number with letters", async ({ page, account }) => {
    await expect(page.getByText(account.email)).toBeVisible();
    await page.getByLabel("Nomor HP (opsional)").fill("08abc");
    await page.getByRole("button", { name: "Simpan data diri" }).click();
    await expect(page.getByLabel("Nomor HP (opsional)")).toHaveAttribute("aria-invalid", "true");
  });

  profileTest("a wrong current password keeps the user signed in", async ({ page, account }) => {
    await expect(page.getByText(account.email)).toBeVisible();
    await page.getByLabel("Password sekarang").fill("bukan-password-ini");
    await page.getByLabel("Password baru").fill("password-baru-123");
    await page.getByRole("button", { name: "Ganti password" }).click();
    await expect(page.getByText("Password yang sekarang salah")).toBeVisible();
    await expect(page).toHaveURL("/profile");
    await expect(page.getByRole("button", { name: "Menu akun" })).toBeVisible();
  });

  profileTest("signing out from the profile goes home", async ({ page, account }) => {
    await expect(page.getByText(account.email)).toBeVisible();
    await page.getByRole("button", { name: "Keluar", exact: true }).click();
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("link", { name: "Masuk" })).toBeVisible();
  });

  profileTest(
    "changing the password signs out and the new password works",
    async ({ page, account }) => {
      await page.getByLabel("Password sekarang").fill(account.password);
      await page.getByLabel("Password baru").fill("password-baru-123");
      await page.getByRole("button", { name: "Ganti password" }).click();
      await expect(page).toHaveURL("/login");
      await expect(page.getByText("Password sudah diganti")).toBeVisible();
      await fillLogin(page, account.email, "password-baru-123");
      await expect(page).toHaveURL("/");
    },
  );
});
