import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({
  revalidateTag: vi.fn(),
  unstable_cache: (fn: () => unknown) => fn,
}));

describe("public-menu cache helper", () => {
  it("revalidatePublicMenu calls revalidateTag with the public-menu tag", async () => {
    const { revalidateTag } = await import("next/cache");
    const { revalidatePublicMenu } = await import("./public-menu-cache");
    revalidatePublicMenu();
    expect(revalidateTag).toHaveBeenCalledWith("public-menu");
  }, 15_000);

  it("getPublicMenuCached is a function", async () => {
    const { getPublicMenuCached } = await import("./public-menu-cache");
    expect(typeof getPublicMenuCached).toBe("function");
  });
});
