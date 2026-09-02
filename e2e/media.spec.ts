import { expect, test, type Page } from "@playwright/test";

test.describe("media route", () => {
  test("serves 320/640/960 WebP with immutable headers", async ({ page, request }) => {
    await page.goto("/");
    const mediaId = await mediaIdFromPage(page);
    expect(mediaId).toBeTruthy();
    for (const w of [320, 640, 960]) {
      const res = await request.get(`/media/${mediaId}?w=${String(w)}`);
      expect(res.status(), `GET /media/${mediaId}?w=${String(w)}`).toBe(200);
      expect(res.headers()["content-type"]).toBe("image/webp");
      expect(res.headers()["cache-control"]).toBe("public, max-age=31536000, immutable");
      const body = await res.body();
      expect(body.length).toBeGreaterThan(100);
    }
  });

  test("404 on unknown id or invalid w", async ({ page, request }) => {
    const resBadId = await request.get("/media/does-not-exist?w=640");
    expect(resBadId.status()).toBe(404);

    await page.goto("/");
    const mediaId = await mediaIdFromPage(page);
    const resBadW = await request.get(`/media/${mediaId}?w=999`);
    expect(resBadW.status()).toBe(404);
  });
});

async function mediaIdFromPage(page: Page): Promise<string> {
  const firstImg = page.locator('img[alt]').first();
  await expect(firstImg).toBeVisible();
  const src =
    (await firstImg.evaluate((el: HTMLImageElement) => el.currentSrc || el.src)) ||
    (await firstImg.getAttribute("src"));
  expect(src).toBeTruthy();
  if (!src) {
    throw new Error("product image has no src");
  }
  const mediaId = extractMediaId(src);
  if (!mediaId) {
    throw new Error(`could not extract mediaId from src: ${src}`);
  }
  return mediaId;
}

function extractMediaId(src: string): string | null {
  const decoded = decodeURIComponent(src);
  const uuid =
    /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i.exec(
      decoded,
    );
  return uuid?.[1] ?? null;
}
