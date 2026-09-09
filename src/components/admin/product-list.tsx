// src/components/admin/product-list.tsx
"use client";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import type { AdminMenuDto, CategoryDto, ProductDto } from "@/application/dtos";
import { reorderProductsAction } from "@/app/admin/products/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { LIST_PAGE_SIZE } from "@/lib/constants";
import { toPersianDigits } from "@/lib/format/digits";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";
import { ProductForm } from "./product-form";
import { ProductRow } from "./product-row";

function matchingCategoryIds(draft: AdminMenuDto, catFilter: string): Set<string> | null {
  if (catFilter === "all") return null;
  const parent = draft.categories.find((category) => category.id === catFilter);
  if (parent && parent.children.length > 0) {
    return new Set([parent.id, ...parent.children.map((child) => child.id)]);
  }
  return new Set([catFilter]);
}

function findCategory(draft: AdminMenuDto, id: string): CategoryDto | null {
  for (const category of draft.categories) {
    if (category.id === id) return category;
    for (const child of category.children) {
      if (child.id === id) return child;
    }
  }
  return null;
}

function moveId(ids: string[], from: number, to: number): string[] {
  const next = [...ids];
  const [id] = next.splice(from, 1);
  if (!id) return ids;
  next.splice(to, 0, id);
  return next;
}

/**
 * Admin product list (docs/07). Search/filter/pagination are client-side over
 * the draft. Within a leaf category, order is adjusted with up/down controls.
 */
export function ProductList() {
  const draft = useMenuDraftStore((s) => s.draft);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
  const reorderStore = useMenuDraftStore((s) => s.reorderProducts);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const allCategories = useMemo(() => {
    if (!draft) return [];
    const rows: { id: string; name: string }[] = [];
    for (const category of draft.categories) {
      rows.push({ id: category.id, name: category.name });
      for (const child of category.children) {
        rows.push({ id: child.id, name: `${category.name} / ${child.name}` });
      }
    }
    return rows;
  }, [draft]);

  const leafForReorder = useMemo(() => {
    if (!draft || catFilter === "all") return null;
    const category = findCategory(draft, catFilter);
    if (!category || category.children.length > 0) return null;
    return category;
  }, [draft, catFilter]);

  const filteredProducts = useMemo(() => {
    if (!draft) return [];
    let rows: ProductDto[] = [];
    for (const category of draft.categories) {
      rows = rows.concat(category.products);
      for (const child of category.children) {
        rows = rows.concat(child.products);
      }
    }
    const ids = matchingCategoryIds(draft, catFilter);
    if (ids) {
      rows = rows.filter((product) => ids.has(product.categoryId));
    }
    const query = search.trim();
    if (query) {
      rows = rows.filter((product) => product.name.includes(query));
    }
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [draft, catFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / LIST_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredProducts.slice(
    (currentPage - 1) * LIST_PAGE_SIZE,
    currentPage * LIST_PAGE_SIZE,
  );

  const openEditor = (product: ProductDto | null) => {
    setEditing(product);
    setIsCreating(product === null);
  };

  const moveProduct = (productId: string, direction: -1 | 1) => {
    if (!leafForReorder) return;
    const ids = filteredProducts.map((product) => product.id);
    const from = ids.indexOf(productId);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= ids.length) return;
    const previous = ids;
    const nextIds = moveId(ids, from, to);
    reorderStore(leafForReorder.id, nextIds);
    void reorderProductsAction(leafForReorder.id, nextIds).then((result) => {
      if (result.ok) {
        clearDirty();
        return;
      }
      reorderStore(leafForReorder.id, previous);
      toast.error(result.error.fa);
    });
  };

  if (!draft) return null;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={strings.admin.searchPlaceholder}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="ps-10"
          />
        </div>
        <Select
          value={catFilter}
          onValueChange={(value) => {
            setCatFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger
            aria-label={strings.admin.allCategories}
            className="w-full md:w-[220px]"
          >
            <SelectValue placeholder={strings.admin.allCategories} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{strings.admin.allCategories}</SelectItem>
            {allCategories.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => openEditor(null)} className="w-full md:w-auto">
          <Plus className="h-4 w-4 me-2" />
          {strings.admin.newProduct}
        </Button>
      </div>

      <div>
        {paginated.map((product, pageIndex) => {
          const index = (currentPage - 1) * LIST_PAGE_SIZE + pageIndex;
          const canReorder = Boolean(leafForReorder) && search.trim() === "";
          return (
            <ProductRow
              key={product.id}
              product={product}
              onEdit={() => openEditor(product)}
              clearDirty={clearDirty}
              onMoveUp={
                canReorder && index > 0 ? () => moveProduct(product.id, -1) : undefined
              }
              onMoveDown={
                canReorder && index < filteredProducts.length - 1
                  ? () => moveProduct(product.id, 1)
                  : undefined
              }
            />
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          {strings.admin.noResults}
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Button
              key={n}
              variant={currentPage === n ? "default" : "outline"}
              size="sm"
              data-testid={`pagination-page-${n}`}
              onClick={() => setPage(n)}
            >
              {toPersianDigits(n)}
            </Button>
          ))}
        </div>
      )}

      {(isCreating || editing) && (
        <ProductForm
          product={editing}
          onClose={() => {
            setIsCreating(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
