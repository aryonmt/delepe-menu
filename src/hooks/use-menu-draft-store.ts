// src/hooks/use-menu-draft-store.ts
import { create } from "zustand";
import type {
  AdminMenuDto,
  CategoryDto,
  ProductDto,
  SettingsDto,
} from "@/application/dtos";
import { refreshAdminMenuAction } from "@/app/admin/_actions";

/** Snapshot taken when an edit session opens; restored on cancel (docs/07 rule 3). */
type EditSnapshot = { draft: AdminMenuDto; isDirty: boolean };

interface MenuDraftState {
  draft: AdminMenuDto | null;
  savedVersion: number;
  isDirty: boolean;
  editSnapshot: EditSnapshot | null;
  hydrate: (data: AdminMenuDto) => void;
  resetToSaved: () => Promise<void>;
  beginEditSession: () => void;
  cancelEditSession: () => void;
  commitEditSession: () => void;
  upsertProduct: (product: ProductDto) => void;
  removeProduct: (id: string) => void;
  updateProductAvailability: (id: string, isAvailable: boolean) => void;
  reorderProducts: (categoryId: string, orderedIds: string[]) => void;
  upsertCategory: (category: CategoryDto) => void;
  removeCategory: (id: string) => void;
  reorderCategories: (parentId: string | null, orderedIds: string[]) => void;
  updateSettings: (settings: SettingsDto) => void;
  clearDirty: () => void;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Every product list in the tree (top-level + children), for in-place edits. */
function insertBySortOrder(list: ProductDto[], product: ProductDto): void {
  const index = list.findIndex((item) => item.sortOrder > product.sortOrder);
  if (index === -1) list.push(product);
  else list.splice(index, 0, product);
}

function findProductList(draft: AdminMenuDto, categoryId: string): ProductDto[] | null {
  for (const category of draft.categories) {
    if (category.id === categoryId) return category.products;
    for (const child of category.children) {
      if (child.id === categoryId) return child.products;
    }
  }
  return null;
}

function productLists(draft: AdminMenuDto): ProductDto[][] {
  const lists: ProductDto[][] = [];
  for (const category of draft.categories) {
    lists.push(category.products);
    for (const child of category.children) lists.push(child.products);
  }
  return lists;
}

/** Every category list (top-level list + each parent's children list). */
function categoryLists(draft: AdminMenuDto): CategoryDto[][] {
  const lists: CategoryDto[][] = [draft.categories];
  for (const category of draft.categories) lists.push(category.children);
  return lists;
}

export const useMenuDraftStore = create<MenuDraftState>((set, get) => ({
  draft: null,
  savedVersion: 0,
  isDirty: false,
  editSnapshot: null,

  hydrate: (data) => set({ draft: data, savedVersion: 0, isDirty: false, editSnapshot: null }),

  resetToSaved: async () => {
    const result = await refreshAdminMenuAction();
    if (!result.ok) return;
    set((state) => ({
      draft: result.data,
      savedVersion: state.savedVersion + 1,
      isDirty: false,
      editSnapshot: null,
    }));
  },

  beginEditSession: () => {
    const { draft, isDirty } = get();
    if (!draft) return;
    set({ editSnapshot: { draft: clone(draft), isDirty } });
  },

  cancelEditSession: () => {
    const snapshot = get().editSnapshot;
    if (!snapshot) return;
    set({ draft: snapshot.draft, isDirty: snapshot.isDirty, editSnapshot: null });
  },

  commitEditSession: () =>
    set((state) => ({
      editSnapshot: null,
      isDirty: false,
      savedVersion: state.savedVersion + 1,
    })),

  upsertProduct: (product) => {
    const draft = get().draft;
    if (!draft) return;
    const next = clone(draft);
    let placed = false;
    for (const list of productLists(next)) {
      const index = list.findIndex((item) => item.id === product.id);
      if (index === -1) continue;
      if (list[index]?.categoryId === product.categoryId) {
        list[index] = product;
        placed = true;
        break;
      }
      list.splice(index, 1);
    }
    if (!placed) {
      for (const category of next.categories) {
        if (category.id === product.categoryId) {
          insertBySortOrder(category.products, product);
          placed = true;
          break;
        }
        for (const child of category.children) {
          if (child.id === product.categoryId) {
            insertBySortOrder(child.products, product);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }
    set({ draft: next, isDirty: true });
  },

  removeProduct: (id) => {
    const draft = get().draft;
    if (!draft) return;
    const next = clone(draft);
    for (const list of productLists(next)) {
      const index = list.findIndex((item) => item.id === id);
      if (index !== -1) list.splice(index, 1);
    }
    set({ draft: next, isDirty: true });
  },

  updateProductAvailability: (id, isAvailable) => {
    const draft = get().draft;
    if (!draft) return;
    const next = clone(draft);
    for (const list of productLists(next)) {
      for (const item of list) {
        if (item.id === id) item.isAvailable = isAvailable;
      }
    }
    set({ draft: next, isDirty: true });
  },

  reorderProducts: (categoryId, orderedIds) => {
    const draft = get().draft;
    if (!draft) return;
    const next = clone(draft);
    const list = findProductList(next, categoryId);
    if (!list) return;
    list.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
    list.forEach((item, index) => {
      item.sortOrder = (index + 1) * 10;
    });
    set({ draft: next, isDirty: true });
  },

  upsertCategory: (category) => {
    const draft = get().draft;
    if (!draft) return;
    const next = clone(draft);
    for (const list of categoryLists(next)) {
      const index = list.findIndex((item) => item.id === category.id);
      if (index !== -1) list.splice(index, 1);
    }
    if (category.parentId === null) {
      next.categories.push(category);
    } else {
      const parent = next.categories.find((item) => item.id === category.parentId);
      if (parent) parent.children.push(category);
      else next.categories.push(category);
    }
    set({ draft: next, isDirty: true });
  },

  removeCategory: (id) => {
    const draft = get().draft;
    if (!draft) return;
    const next = clone(draft);
    for (const list of categoryLists(next)) {
      const index = list.findIndex((item) => item.id === id);
      if (index !== -1) list.splice(index, 1);
    }
    set({ draft: next, isDirty: true });
  },

  reorderCategories: (parentId, orderedIds) => {
    const draft = get().draft;
    if (!draft) return;
    const next = clone(draft);
    const list =
      parentId === null
        ? next.categories
        : (next.categories.find((item) => item.id === parentId)?.children ?? []);
    list.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
    list.forEach((item, index) => {
      item.sortOrder = (index + 1) * 10;
    });
    set({ draft: next, isDirty: true });
  },

  updateSettings: (settings) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, settings: clone(settings) }, isDirty: true });
  },

  clearDirty: () =>
    set((state) => ({ isDirty: false, savedVersion: state.savedVersion + 1 })),
}));