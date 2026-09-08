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

async function saveUnavailableMode(page: Page, mode: "MUTED" | "HIDE") {
  await page.goto("/admin/settings");
  await page.getByTestId(`unavailable-mode-${mode}`).check();
  await page.getByRole("button", { name: strings.admin.save }).click();
  await expect(page.getByRole("status")).toHaveText(strings.admin.settingsSaved);
}

test.describe("public menu", () => {
  test("row 1 — load / → hero, tabs, ≥1 section, images visible; آب کرفس renders grayscale with امروز تموم شد", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("hero")).toBeVisible();
    await expect(page.getByTestId("category-tabs")).toBeVisible();
    const sections = page.locator('[data-testid^="section-"]');
    await expect(sections.first()).toBeVisible();
    await expect(sections).toHaveCount(6, { timeout: 10_000 });

    const images = page.locator("img[alt]");
    await expect(images.first()).toBeVisible();

    const celery = page.getByTestId("product-آب کرفس");
    await expect(celery).toBeVisible();
    await celery.scrollIntoViewIfNeeded();
    await expect(celery).toHaveAttribute("data-available", "false");
    await expect(celery.getByTestId("unavailable-chip")).toHaveText("امروز تموم شد");
    await expect(celery).toHaveCSS("opacity", "0.7");
  });

  test("row 2 — tap غذای اصلی → scroll + scrollspy activates the tab", async ({ page }) => {
    await page.goto("/");
    const tab = page.getByTestId("tab-غذای اصلی");
    await expect(tab).toBeVisible();
    await tab.click();
    await expect(tab).toHaveAttribute("data-active", "true");

    const section = page.getByTestId("section-غذای اصلی");
    await expect(section).toBeVisible();

    const pizzaHeader = section.getByText("پیتزا", { exact: true });
    if ((await pizzaHeader.count()) > 0) {
      await pizzaHeader.first().scrollIntoViewIfNeeded();
      await expect(tab).toHaveAttribute("data-active", "true");
    }
  });

  test("row 3 — پیتزا مارگاریتا shows از ۵۵۰ هزار تومان and expands variants", async ({
    page,
  }) => {
    await page.goto("/");
    const card = page.getByTestId("product-پیتزا مارگاریتا");
    await card.scrollIntoViewIfNeeded();
    await expect(card.getByTestId("price")).toHaveText("از ۵۵۰ هزار تومان");
    await card.getByTestId("variant-toggle").click();
    const list = card.getByTestId("variant-list");
    await expect(list).toBeVisible();
    await expect(list).toContainText("سایز کوچک");
    await expect(list).toContainText("۵۵۰ هزار تومان");
    await expect(list).toContainText("سایز بزرگ");
    await expect(list).toContainText("۷۵۰ هزار تومان");
  });

  test("row 4 — کوکی متوسط shows discounted price with −۱۷٪ chip", async ({ page }) => {
    await page.goto("/");
    const cookie = page.getByTestId("product-کوکی متوسط");
    await cookie.scrollIntoViewIfNeeded();
    await expect(cookie.getByTestId("price")).toHaveText("۹۵ هزار تومان");
    await expect(cookie.getByTestId("price-original")).toHaveText("۱۱۵ هزار تومان");
    await expect(cookie.getByTestId("discount-chip")).toHaveText("−۱۷٪");
  });

  test("row 5 — MUTED → HIDE switch hides آب کرفس", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/");
    await expect(page.getByTestId("product-آب کرفس")).toBeVisible();
    await loginAsAdmin(page);
    try {
      await saveUnavailableMode(page, "HIDE");
      await page.goto("/");
      await expect(page.getByTestId("hero")).toBeVisible();
      await expect(page.getByTestId("product-آب کرفس")).toHaveCount(0);
    } finally {
      await saveUnavailableMode(page, "MUTED");
    }
  });

  test("row 6 — product in leaf category renders", async ({ page }) => {
    await page.goto("/");
    const hotDrinks = page.getByTestId("section-نوشیدنی گرم");
    await expect(hotDrinks.getByTestId("product-اسپرسو")).toBeVisible();
  });

  test("chips filter the active category to a child", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("tab-غذای اصلی").click();
    const chips = page.getByTestId("subcategory-chips");
    await expect(chips).toBeVisible();
    await expect(chips.getByRole("button", { name: strings.public.allSubcategories })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await chips.getByRole("button", { name: "پیتزا" }).click();
    const section = page.getByTestId("section-غذای اصلی");
    await expect(section.getByTestId("product-پیتزا مارگاریتا")).toBeVisible();
    await expect(section.getByTestId("product-بمب دلِپ")).toHaveCount(0);
  });
});

test.describe("public menu desktop grid", () => {
  test.use({
    viewport: { width: 1024, height: 768 },
    isMobile: false,
    hasTouch: false,
  });

  test("md+ sections use a 2-column product grid", async ({ page }) => {
    await page.goto("/");
    const grid = page
      .getByTestId("section-نوشیدنی سرد")
      .getByTestId("product-grid")
      .first();
    await expect(grid).toBeVisible();
    const columns = await grid.evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(columns.split(" ").length).toBe(2);
  });
});