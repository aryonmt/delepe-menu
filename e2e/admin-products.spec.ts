// e2e/admin-products.spec.ts
import { expect, test, type Page } from "@playwright/test";
import { strings } from "../src/lib/fa/strings";

const username = process.env.ADMIN_USERNAME ?? "admin";
const password = process.env.ADMIN_PASSWORD ?? "change-me-now";
/* 1x1 red PNG — square fixture satisfies BR-11 (1:1). */
const PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64",
);

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel(strings.auth.username).fill(username);
  await page.getByLabel(strings.auth.password).fill(password);
  await page.getByRole("button", { name: strings.auth.submit }).click();
  await expect(page).toHaveURL(/\/admin\/products$/);
}

function row(page: Page, name: string) {
  return page.getByTestId(`admin-product-row-${name}`);
}

test.describe("admin products", () => {
  test("authenticated admin sees the seeded list", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByRole("heading", { name: strings.admin.productsHeading })).toBeVisible();
    await expect(row(page, "اسپرسو")).toBeVisible();
  });

  test("search filters products client-side", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByPlaceholder(strings.admin.searchPlaceholder).fill("اسپرسو");
    await expect(row(page, "اسپرسو دبل")).toBeVisible();
    await expect(row(page, "پیتزا مخصوص")).toHaveCount(0);
  });

  test("category filter limits the list", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "غذای اصلی / بشقاب" }).click();
    await expect(row(page, "پنه آلفردو")).toBeVisible();
    await expect(row(page, "اسپرسو")).toHaveCount(0);
  });

  test("pagination pages through the full list", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(page.getByTestId("pagination-page-2")).toBeVisible();
    await page.getByTestId("pagination-page-2").click();
    await expect(row(page, "اسپرسو")).toHaveCount(0);
  });

  test("availability toggle flips optimistically and persists", async ({ page }) => {
    await loginAsAdmin(page);
    const target = row(page, "اسپرسو");
    const toggle = target.getByRole("switch");
    const before = await toggle.getAttribute("data-state");
    await toggle.click();
    await expect(toggle).not.toHaveAttribute("data-state", before ?? "checked");
    await page.reload();
    await expect(row(page, "اسپرسو").getByRole("switch")).not.toHaveAttribute(
      "data-state",
      before ?? "checked",
    );
    await row(page, "اسپرسو").getByRole("switch").click();
  });

  test("create product with Persian digits", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: strings.admin.newProduct }).click();
    await page.getByLabel(strings.admin.name).fill("محصول تست");
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "نوشیدنی سرد" }).click();
    await page.getByLabel(strings.admin.price).fill("۱۲۵۰۰۰");
    await page.getByRole("button", { name: strings.admin.save }).click();
    await expect(page.getByText(strings.admin.productCreated)).toBeVisible();
    await page.getByPlaceholder(strings.admin.searchPlaceholder).fill("محصول تست");
    await expect(row(page, "محصول تست")).toBeVisible();
  });

  test("variants auto-price disables manual price and hides discount (BR-13/14)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: strings.admin.newProduct }).click();
    await page.getByRole("button", { name: strings.admin.addVariant }).click();
    await page.getByRole("button", { name: strings.admin.addVariant }).click();
    await page.getByPlaceholder(strings.admin.variantPrice).nth(0).fill("۷۵۰۰۰۰");
    await page.getByPlaceholder(strings.admin.variantPrice).nth(1).fill("۵۵۰۰۰۰");
    const priceInput = page.getByLabel(strings.admin.price);
    await expect(priceInput).toBeDisabled();
    await expect(priceInput).toHaveValue("550000");
    await expect(page.getByLabel(strings.admin.discountActive)).toHaveCount(0);
  });

  test("upload fixture image shows progress and success toast", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("button", { name: strings.admin.newProduct }).click();
    await page.setInputFiles("#pf-image", {
      name: "pixel.png",
      mimeType: "image/png",
      buffer: PIXEL_PNG,
    });
    const cropDialog = page.getByRole("dialog").filter({ hasText: strings.admin.cropImage });
    await expect(cropDialog).toBeVisible();
    await cropDialog.getByRole("button", { name: strings.admin.save }).click();
    await expect(page.getByText(strings.admin.imageUploaded)).toBeVisible();
  });

  test("delete requires confirmation and removes the row", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByPlaceholder(strings.admin.searchPlaceholder).fill("آب هویج");
    await row(page, "آب هویج").getByTestId("delete-product").click();
    const confirm = page.getByRole("alertdialog");
    await expect(confirm).toContainText("آب هویج");
    await confirm.getByRole("button", { name: strings.admin.delete }).click();
    await expect(page.getByText(strings.admin.productDeleted)).toBeVisible();
    await expect(row(page, "آب هویج")).toHaveCount(0);
  });

  test("reorder handles disabled while searching", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "غذای اصلی / بشقاب" }).click();
    await expect(page.getByTestId("reorder-handle").first()).toBeEnabled();
    await page.getByPlaceholder(strings.admin.searchPlaceholder).fill("پنه");
    await expect(page.getByTestId("reorder-handle").first()).toBeDisabled();
  });

  test("reorder leaf category persists across reload (BR-07)", async ({ page }) => {
    await loginAsAdmin(page);
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "غذای اصلی / بشقاب" }).click();
    const firstBefore = await page.getByTestId("admin-product-name").first().innerText();
    const secondBefore = await page.getByTestId("admin-product-name").nth(1).innerText();
    const handle0 = page.getByTestId("reorder-handle").nth(0);
    const handle1 = page.getByTestId("reorder-handle").nth(1);
    await handle0.hover();
    await page.mouse.down();
    await handle1.hover();
    await page.mouse.move(page.mouse as never, 0);
    await page.mouse.up();
    await page.reload();
    await page.getByRole("combobox").first().click();
    await page.getByRole("option", { name: "غذای اصلی / بشقاب" }).click();
    await expect(page.getByTestId("admin-product-name").first()).toHaveText(secondBefore);
    expect(firstBefore).not.toBe(secondBefore);
  });
});