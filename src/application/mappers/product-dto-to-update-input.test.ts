import { describe, expect, it } from "vitest";
import type { ProductDto } from "@/application/dtos";
import { productDtoToUpdateInput } from "./product-dto-to-update-input";

function sampleProduct(): ProductDto {
  return {
    id: "p1",
    name: "لاته",
    description: "اسپرسو",
    price: 250_000,
    discountedPrice: null,
    discountActive: false,
    isAvailable: true,
    badges: ["NEW"],
    sortOrder: 10,
    categoryId: "leaf",
    variants: [{ id: "v1", name: "کوچک", price: 200_000, sortOrder: 10 }],
    media: { id: "media-1", dominantColor: "#123456", width: 800, height: 800 },
  };
}

describe("productDtoToUpdateInput", () => {
  it("passes mediaId so an availability toggle cannot wipe the image", () => {
    const input = productDtoToUpdateInput(sampleProduct(), { isAvailable: false });
    expect(input.mediaId).toBe("media-1");
    expect(input.isAvailable).toBe(false);
    expect(input.variants).toEqual([{ name: "کوچک", price: 200_000 }]);
  });
});
