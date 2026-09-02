import { expect, test } from "@playwright/test";

test.describe("public menu", () => {
  test("row 1 — load / → hero, tabs, ≥1 section, images visible; آب کرفس renders grayscale with ناموجود", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByTestId("hero")).toBeVisible();
    await expect(page.getByTestId("category-tabs")).toBeVisible();

    const sections = page.locator('[data-testid^="section-"]');
    await expect(sections.first()).toBeVisible();
    await expect(sections).toHaveCount(6, { timeout: 10_000 });

    // Images - at least the first images are visible
    const images = page.locator('img[alt]');
    await expect(images.first()).toBeVisible();

    // MUTED demo: آب کرفس isAvailable=false → grayscale + ناموجود chip
    const celery = page.getByTestId("product-آب کرفس");
    await expect(celery).toBeVisible();
    await expect(celery).toHaveAttribute("data-available", "false");
    await expect(celery.getByTestId("unavailable-chip")).toHaveText("ناموجود");
    // Card opacity .7 when muted
    await expect(celery).toHaveCSS("opacity", "0.7");
  });

  test("row 2 — tap غذای اصلی → scroll + scrollspy activates the tab", async ({ page }) => {
    await page.goto("/");

    const tab = page.getByTestId("tab-غذای اصلی");
    await expect(tab).toBeVisible();
    await tab.click();

    // After click, the tab should become active
    await expect(tab).toHaveAttribute("data-active", "true");

    // The corresponding section should be visible
    const section = page.getByTestId("section-غذای اصلی");
    await expect(section).toBeVisible();

    // Scrollspy: after scrolling near پیتزا group, still within غذای اصلی section, tab stays active
    // Simulate scroll to پیتزا sub-header (which is inside غذای اصلی)
    const pizzaHeader = section.getByText("پیتزا", { exact: true });
    // It may be sub-header text
    if (await pizzaHeader.count() > 0) {
      await pizzaHeader.first().scrollIntoViewIfNeeded();
      await expect(tab).toHaveAttribute("data-active", "true");
    }
  });

  test.fixme("row 3 — پیتزا مارگاریتا shows از ۵۵۰ هزار تومان and expands variants", async () => {
    // doc 06 row 3: enabled in M4 (B-04 variants expander)
  });

  test.fixme("row 4 — کوکی متوسط shows discounted price with −۱۷٪ chip", async () => {
    // doc 06 row 4: enabled in M4 (B-05 discount UI)
  });

  test.fixme("row 5 — MUTED → HIDE switch hides آب کرفس", async () => {
    // doc 06 row 5: requires settings mutation (M6); HIDE mode tested via mapper unit already
  });

  test.fixme("row 6 — product in leaf category renders; non-leaf assignment impossible", async () => {
    // doc 06 row 6: requires admin leaf guard (M5) plus public rendering; schema already prevents non-leaf
  });
});
