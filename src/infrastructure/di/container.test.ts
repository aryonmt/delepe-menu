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
      container.getMedia(),
      container.deleteMedia(),
      container.login(),
      container.logout(),
      container.changePassword(),
      container.verifySession(),
    ];
    expect(constructed).toHaveLength(22);
    for (const useCase of constructed) {
      expect(useCase).toBeDefined();
      expect(typeof useCase.execute).toBe("function");
    }
  });
});
