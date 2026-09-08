import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AdminMenuDto, ProductDto } from "@/application/dtos";

vi.mock("@/app/admin/_actions", () => ({
  refreshAdminMenuAction: vi.fn(),
}));

import { refreshAdminMenuAction } from "@/app/admin/_actions";
import { useMenuDraftStore } from "./use-menu-draft-store";

const refresh = vi.mocked(refreshAdminMenuAction);

function product(name: string, categoryId: string): ProductDto {
  return {
    id: name,
    name,
    description: null,
    price: 100_000,
    discountedPrice: null,
    discountActive: false,
    isAvailable: true,
    badges: [],
    sortOrder: 10,
    categoryId,
    variants: [],
    media: null,
  };
}

function menu(restaurantName = "دِ‌لِ‌پِ"): AdminMenuDto {
  const leaf = {
    id: "leaf",
    name: "قهوه",
    parentId: "hot",
    sortOrder: 10,
    children: [] as AdminMenuDto["categories"],
    products: [product("اسپرسو", "leaf")],
  };
  return {
    settings: {
      restaurantName,
      theme: "WARM_HONEY",
      unavailableMode: "MUTED",
      tickerProductIds: [],
    },
    categories: [
      {
        id: "hot",
        name: "نوشیدنی گرم",
        parentId: null,
        sortOrder: 10,
        children: [leaf],
        products: [],
      },
    ],
  };
}

describe("useMenuDraftStore", () => {
  beforeEach(() => {
    useMenuDraftStore.setState({
      draft: null,
      savedVersion: 0,
      isDirty: false,
      editSnapshot: null,
    });
    refresh.mockReset();
  });

  it("upsertProduct moves a product into the target leaf", () => {
    useMenuDraftStore.getState().hydrate(menu());
    const moved = product("اسپرسو", "leaf");
    moved.price = 999_000;
    useMenuDraftStore.getState().upsertProduct(moved);
    const draft = useMenuDraftStore.getState().draft;
    expect(draft?.categories[0]?.children[0]?.products[0]?.price).toBe(999_000);
    expect(useMenuDraftStore.getState().isDirty).toBe(true);
  });

  it("cancelEditSession restores the snapshot and dirty flag (docs/07 AC-7)", () => {
    useMenuDraftStore.getState().hydrate(menu());
    useMenuDraftStore.getState().beginEditSession();
    const edited = product("اسپرسو", "leaf");
    edited.price = 999_000;
    useMenuDraftStore.getState().upsertProduct(edited);
    useMenuDraftStore.getState().cancelEditSession();
    expect(useMenuDraftStore.getState().draft?.categories[0]?.children[0]?.products[0]?.price).toBe(
      100_000,
    );
    expect(useMenuDraftStore.getState().isDirty).toBe(false);
    expect(useMenuDraftStore.getState().editSnapshot).toBeNull();
  });

  it("updateSettings writes restaurantName into draft for live preview", () => {
    useMenuDraftStore.getState().hydrate(menu());
    const settings = useMenuDraftStore.getState().draft?.settings;
    if (!settings) throw new Error("missing settings");
    useMenuDraftStore.getState().updateSettings({ ...settings, restaurantName: "کافه تست" });
    expect(useMenuDraftStore.getState().draft?.settings.restaurantName).toBe("کافه تست");
  });

  it("resetToSaved replaces draft from GetAdminMenu", async () => {
    useMenuDraftStore.getState().hydrate(menu());
    const settings = useMenuDraftStore.getState().draft?.settings;
    if (!settings) throw new Error("missing settings");
    useMenuDraftStore.getState().updateSettings({ ...settings, restaurantName: "کافه تست" });
    refresh.mockResolvedValue({ ok: true, data: menu("دِ‌لِ‌پِ") });
    await useMenuDraftStore.getState().resetToSaved();
    expect(useMenuDraftStore.getState().draft?.settings.restaurantName).toBe("دِ‌لِ‌پِ");
    expect(useMenuDraftStore.getState().isDirty).toBe(false);
  });
});
