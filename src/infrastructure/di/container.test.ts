import { describe, expect, it } from "vitest";
import { container } from "./container";

describe("DI container", () => {
  it("constructs every use-case without errors", () => {
    const constructed = [
      container.getPublicMenu(),
      container.getAdminMenu(),
      container.listCategories(),
      container.createCategory(),
      container.updateCategory(),
      container.deleteCategory(),
      container.reorderCategories(),
      container.listProducts(),
      container.getProduct(),
      container.createProduct(),
      container.updateProduct(),
      container.deleteProduct(),
      container.reorderProducts(),
      container.getSettings(),
      container.updateSettings(),
      container.uploadMedia(),
      container.deleteMedia(),
    ];
    expect(constructed).toHaveLength(17);
    for (const useCase of constructed) {
      expect(useCase).toBeDefined();
      expect(typeof useCase.execute).toBe("function");
    }
  });
});
