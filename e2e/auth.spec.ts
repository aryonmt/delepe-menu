// e2e/auth.spec.ts
import { expect, test, type Page } from "@playwright/test";
import { strings } from "../src/lib/fa/strings";

test.describe.configure({ mode: "serial" });

const username = process.env.ADMIN_USERNAME ?? "admin";
const password = process.env.ADMIN_PASSWORD ?? "change-me-now";

async function submitLogin(page: Page, user: string, pass: string) {
  await page.goto("/login");
  await page.getByLabel(strings.auth.username).fill(user);
  await page.getByLabel(strings.auth.password).fill(pass);
  await page.getByRole("button", { name: strings.auth.submit }).click();
}

async function loginAsAdmin(page: Page) {
  await submitLogin(page, username, password);
  await expect(page).toHaveURL(/\/admin\/products$/);
}

async function openUserMenu(page: Page) {
  await page.getByRole("button", { name: strings.auth.userMenu }).click();
}

async function changePassword(page: Page, current: string, next: string) {
  await openUserMenu(page);
  await page.getByRole("menuitem", { name: strings.auth.changePassword }).click();
  await page.getByLabel(strings.auth.currentPassword, { exact: true }).fill(current);
  await page.getByLabel(strings.auth.nextPassword, { exact: true }).fill(next);
  await page.getByLabel(strings.auth.confirmPassword, { exact: true }).fill(next);
  await page.getByRole("button", { name: strings.auth.savePassword }).click();
  await page.getByRole("button", { name: strings.auth.confirmPasswordChange }).click();
  await expect(page.getByTestId("change-password-status")).toHaveText(
    strings.auth.passwordChanged,
  );
  await page.getByRole("dialog").getByLabel(strings.admin.cancel).click();
}

test.describe("auth", () => {
  test("unauthenticated /admin/products redirects to /login", async ({ page }) => {
    await page.goto("/admin/products");
    await expect(page).toHaveURL(/\/login$/);
  });

  test("failed login shows the generic Persian error", async ({ page }) => {
    await submitLogin(page, username, "not-the-password");
    const alert = page.locator('[data-error-code="INVALID_CREDENTIALS"]');
    await expect(alert).toHaveText(strings.errors.domain.INVALID_CREDENTIALS);
  });

  test("successful login lands on products and logout returns to login", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(
      page.getByRole("heading", { name: strings.admin.productsHeading }),
    ).toBeVisible();
    await openUserMenu(page);
    await page.getByRole("menuitem", { name: strings.auth.logout }).click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("authenticated /admin redirects to products; /login redirects too", async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin\/products$/);
    await page.goto("/login");
    await expect(page).toHaveURL(/\/admin\/products$/);
  });

  test("change password then login with the new password", async ({ page }) => {
    const nextPassword = "new-secret-99";
    await loginAsAdmin(page);
    await changePassword(page, password, nextPassword);
    await openUserMenu(page);
    await page.getByRole("menuitem", { name: strings.auth.logout }).click();
    await expect(page).toHaveURL(/\/login$/);
    await submitLogin(page, username, nextPassword);
    await expect(page).toHaveURL(/\/admin\/products$/);
    await changePassword(page, nextPassword, password);
  });

  test("sixth failed attempt returns RATE_LIMITED with the exact Persian string", async ({ page }) => {
    const lockoutUser = `lockout-${Date.now()}`;
    for (let i = 0; i < 5; i += 1) {
      await submitLogin(page, lockoutUser, "wrong-password");
      await expect(
        page.locator('[data-error-code="INVALID_CREDENTIALS"]'),
      ).toBeVisible();
    }
    await submitLogin(page, lockoutUser, "wrong-password");
    await expect(page.locator('[data-error-code="RATE_LIMITED"]')).toHaveText(
      "تعداد تلاش‌ها بیش از حد مجاز است؛ ۱۵ دقیقه دیگر تلاش کنید",
    );
  });
});