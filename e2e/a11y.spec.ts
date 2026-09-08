import AxeBuilder from "@axe-core/playwright";
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

async function expectNoCriticalViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  const critical = results.violations.filter((violation) => violation.impact === "critical");
  expect(critical).toEqual([]);
}

test.describe("a11y", () => {
  test("/ has no critical axe violations", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero")).toBeVisible();
    await expectNoCriticalViolations(page);
  });

  test("/login has no critical axe violations", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: strings.auth.title })).toBeVisible();
    await expectNoCriticalViolations(page);
  });

  test("/admin/products has no critical axe violations", async ({ page }) => {
    await loginAsAdmin(page);
    await expect(
      page.getByRole("heading", { name: strings.admin.productsHeading }),
    ).toBeVisible();
    await expectNoCriticalViolations(page);
  });
});
