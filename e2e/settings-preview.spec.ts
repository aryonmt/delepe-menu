// e2e/settings-preview.spec.ts
import { expect, test, type Page } from "@playwright/test";
import { strings } from "../src/lib/fa/strings";

const username = process.env.ADMIN_USERNAME ?? "admin";
const password = process.env.ADMIN_PASSWORD ?? "change-me-now";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel(strings.auth.username).fill(username);
  await page.getByLabel(strings.auth.password).fill(password);
  await page.getByRole("button", { name: strings.auth.submit }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
}

async function openPreview(page: Page) {
  await page.getByTestId("admin-preview").click();
  const frame = page.getByTestId("preview-frame");
  await expect(frame).toBeVisible();
  return frame;
}

test.describe("settings + live preview", () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test("preview reflects draft restaurant name before save, reset restores", async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .getByRole("link", { name: strings.admin.settingsHeading })
      .first()
      .click();
    const frame = await openPreview(page);
    await expect(frame.getByTestId("hero")).toContainText("دِ‌لِ‌پِ");
    await page.getByLabel(strings.admin.restaurantName).fill("کافه تست");
    await expect(frame.getByTestId("hero")).toContainText("کافه تست");
    await page.getByTestId("preview-reset").click();
    await expect(frame.getByTestId("hero")).toContainText("دِ‌لِ‌پِ");
  });

  test("HIDE mode removes an unavailable product from the preview before save", async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page);
    await page
      .getByRole("link", { name: strings.admin.settingsHeading })
      .first()
      .click();
    const frame = await openPreview(page);
    await frame.getByTestId("product-آب کرفس").scrollIntoViewIfNeeded();
    await expect(frame.getByTestId("product-آب کرفس")).toBeVisible();
    await page.getByTestId("unavailable-mode-HIDE").check();
    await expect(frame.getByTestId("product-آب کرفس")).toHaveCount(0);
    await page.getByTestId("preview-reset").click();
    await frame.getByTestId("product-آب کرفس").scrollIntoViewIfNeeded();
    await expect(frame.getByTestId("product-آب کرفس")).toBeVisible();
  });

  test("settings save reflects on the public menu", async ({ page }) => {
    await loginAsAdmin(page);
    await page
      .getByRole("link", { name: strings.admin.settingsHeading })
      .first()
      .click();
    await page.getByLabel(strings.admin.restaurantName).fill("دِ‌لِ‌پِ تست");
    await page
      .getByTestId("settings-form")
      .getByRole("button", { name: strings.admin.save })
      .click();
    await expect(page.getByRole("status")).toHaveText(strings.admin.settingsSaved);
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("دِ‌لِ‌پِ تست");
    await page.goto("/admin/settings");
    await page.getByLabel(strings.admin.restaurantName).fill("دِ‌لِ‌پِ");
    await page
      .getByTestId("settings-form")
      .getByRole("button", { name: strings.admin.save })
      .click();
    await expect(page.getByRole("status")).toHaveText(strings.admin.settingsSaved);
  });

  test("price edit updates preview without save; cancel leaves preview unchanged", async ({ page }) => {
    test.setTimeout(60_000);
    await loginAsAdmin(page);
    await page.getByPlaceholder(strings.admin.searchPlaceholder).fill("اسپرسو");
    await page
      .getByTestId("admin-product-row-اسپرسو")
      .getByTestId("edit-product")
      .click();
    const editor = page.getByRole("dialog", { name: strings.admin.editProduct });
    await expect(editor).toBeVisible();
    const frame = await openPreview(page);
    await editor.getByLabel(strings.admin.price).fill("۹۹۹۰۰۰");
    await frame.getByTestId("product-اسپرسو").scrollIntoViewIfNeeded();
    await expect(frame.getByTestId("product-اسپرسو")).toContainText("۹۹۹ هزار تومان");
    await editor.getByRole("button", { name: strings.admin.cancel }).click();
    await expect(frame.getByTestId("product-اسپرسو")).toContainText("۱۳۰ هزار تومان");
    await expect(frame.getByText("محصول لغو")).toHaveCount(0);
  });
});
