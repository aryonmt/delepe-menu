// e2e/admin-categories.spec.ts
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

async function gotoCategories(page: Page) {
  await page
    .getByRole("link", { name: strings.admin.categoriesHeading })
    .first()
    .click();
  await expect(page).toHaveURL(/\/admin\/categories$/);
}

async function swapTopLevels(page: Page) {
  const firstName = await page
    .locator("[data-depth='0'] [data-testid='admin-category-name']")
    .first()
    .innerText();
  await page.getByTestId(`category-move-down-${firstName}`).click();
}

test.describe("admin categories", () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });
  test("tree lists seeded top-level categories with nested children", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoCategories(page);
    await expect(page.getByTestId("category-row-نوشیدنی گرم")).toBeVisible();
    await expect(page.getByTestId("category-row-قهوه")).toBeVisible();
  });

  test("BR-16: adding a child under a product-owning category shows guard toast", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoCategories(page);
    await page.getByTestId("category-add-child-نوشیدنی سرد").click();
    await page.getByLabel(strings.admin.categoryName).fill("زیردسته تست");
    await page.getByRole("button", { name: strings.admin.save }).click();
    await expect(
      page.getByText(strings.errors.domain.CATEGORY_HAS_PRODUCTS),
    ).toBeVisible();
  });

  test("BR-02: deleting a category with products shows guard toast, nothing deleted", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoCategories(page);
    await page.getByTestId("category-delete-قهوه").click();
    await expect(
      page.getByText(strings.errors.domain.CATEGORY_NOT_EMPTY),
    ).toBeVisible();
    await expect(page.getByTestId("category-row-قهوه")).toBeVisible();
  });

  test("create then delete an empty top-level category", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoCategories(page);
    await page.getByRole("button", { name: strings.admin.newCategory }).click();
    await page.getByLabel(strings.admin.categoryName).fill("دسته موقت");
    await page.getByRole("button", { name: strings.admin.save }).click();
    await expect(page.getByTestId("category-row-دسته موقت")).toBeVisible();
    await page.getByTestId("category-delete-دسته موقت").click();
    await page
      .getByRole("alertdialog")
      .getByRole("button", { name: strings.admin.delete })
      .click();
    await expect(page.getByTestId("category-row-دسته موقت")).toHaveCount(0);
  });

  test("BR-07: reorder top-level categories persists across reload", async ({ page }) => {
    await loginAsAdmin(page);
    await gotoCategories(page);
    const topNames = page.locator("[data-depth='0'] [data-testid='admin-category-name']");
    const firstBefore = await topNames.nth(0).innerText();
    const secondBefore = await topNames.nth(1).innerText();
    await swapTopLevels(page);
    await expect(topNames.nth(0)).toHaveText(secondBefore);
    await page.reload();
    await expect(topNames.nth(0)).toHaveText(secondBefore);
    await swapTopLevels(page);
    await expect(topNames.nth(0)).toHaveText(firstBefore);
    await page.reload();
    await expect(topNames.nth(0)).toHaveText(firstBefore);
  });
});