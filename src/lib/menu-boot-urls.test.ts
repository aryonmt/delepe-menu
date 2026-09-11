import { describe, expect, it } from "vitest";
import type { ProductDto } from "@/application/dtos";
import { HERO_ORBIT_IMAGE_PATHS } from "./hero-orbit-images";
import { collectMenuBootImageUrls } from "./menu-boot";

function product(id: string, mediaId: string | null): ProductDto {
  return {
    id,
    name: id,
    description: null,
    price: 10_000,
    discountedPrice: null,
    discountActive: false,
    isAvailable: true,
    badges: [],
    sortOrder: 10,
    categoryId: "c",
    variants: [],
    media: mediaId
      ? { id: mediaId, dominantColor: "#000000", width: 800, height: 800 }
      : null,
  };
}

describe("collectMenuBootImageUrls", () => {
  it("includes hero orbit images and the first four product photos", () => {
    const urls = collectMenuBootImageUrls([
      product("a", "m1"),
      product("b", null),
      product("c", "m2"),
      product("d", "m3"),
      product("e", "m4"),
      product("f", "m5"),
    ]);
    expect(urls.slice(0, HERO_ORBIT_IMAGE_PATHS.length)).toEqual([...HERO_ORBIT_IMAGE_PATHS]);
    expect(urls.filter((url) => url.startsWith("/media/"))).toEqual([
      "/media/m1?w=640",
      "/media/m2?w=640",
      "/media/m3?w=640",
      "/media/m4?w=640",
    ]);
  });
});
