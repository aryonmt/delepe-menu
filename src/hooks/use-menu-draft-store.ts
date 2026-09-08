import { create } from "zustand";
import type { AdminMenuDto, ProductDto, SettingsDto } from "@/application/dtos";

interface MenuDraftState {
  draft: AdminMenuDto | null;
  savedVersion: number;
  isDirty: boolean;
  hydrate: (data: AdminMenuDto) => void;
  setSavedState: (data: AdminMenuDto) => void;
  upsertProduct: (product: ProductDto) => void;
  removeProduct: (id: string) => void;
  updateProductAvailability: (id: string, isAvailable: boolean) => void;
  reorderProducts: (categoryId: string, orderedIds: string[]) => void;
  updateSettings: (settings: SettingsDto) => void;
  clearDirty: () => void;
}

export const useMenuDraftStore = create<MenuDraftState>((set, get) => ({
  draft: null,
  savedVersion: 0,
  isDirty: false,
  hydrate: (data) => set({ draft: data, savedVersion: 0, isDirty: false }),
  setSavedState: (data) => set({ draft: data, savedVersion: get().savedVersion + 1, isDirty: false }),
  upsertProduct: (product) => {
    const draft = get().draft;
    if (!draft) return;
    const clone = JSON.parse(JSON.stringify(draft)) as AdminMenuDto;
    for (const cat of clone.categories) {
      cat.products = cat.products.filter((p) => p.id !== product.id);
      for (const child of cat.children) {
        child.products = child.products.filter((p) => p.id !== product.id);
      }
    }
    let placed = false;
    for (const cat of clone.categories) {
      if (cat.id === product.categoryId) {
        cat.products.push(product);
        placed = true;
        break;
      }
      for (const child of cat.children) {
        if (child.id === product.categoryId) {
          child.products.push(product);
          placed = true;
          break;
        }
      }
      if (placed) break;
    }
    set({ draft: clone, isDirty: true });
  },
  removeProduct: (id) => {
    const draft = get().draft;
    if (!draft) return;
    const clone = JSON.parse(JSON.stringify(draft)) as AdminMenuDto;
    for (const cat of clone.categories) {
      cat.products = cat.products.filter((p) => p.id !== id);
      for (const child of cat.children) {
        child.products = child.products.filter((p) => p.id !== id);
      }
    }
    set({ draft: clone, isDirty: true });
  },
  updateProductAvailability: (id, isAvailable) => {
    const draft = get().draft;
    if (!draft) return;
    const clone = JSON.parse(JSON.stringify(draft)) as AdminMenuDto;
    for (const cat of clone.categories) {
      for (const p of cat.products) if (p.id === id) p.isAvailable = isAvailable;
      for (const child of cat.children) {
        for (const p of child.products) if (p.id === id) p.isAvailable = isAvailable;
      }
    }
    set({ draft: clone, isDirty: true });
  },
  reorderProducts: (categoryId, orderedIds) => {
    const draft = get().draft;
    if (!draft) return;
    const clone = JSON.parse(JSON.stringify(draft)) as AdminMenuDto;
    for (const cat of clone.categories) {
      if (cat.id === categoryId) {
         cat.products.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
         cat.products.forEach((p, i) => p.sortOrder = (i + 1) * 10);
      }
      for (const child of cat.children) {
        if (child.id === categoryId) {
           child.products.sort((a, b) => orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id));
           child.products.forEach((p, i) => p.sortOrder = (i + 1) * 10);
        }
      }
    }
    set({ draft: clone, isDirty: true });
  },
  updateSettings: (settings) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: { ...draft, settings }, isDirty: true });
  },
  clearDirty: () => set({ isDirty: false, savedVersion: get().savedVersion + 1 }),
}));