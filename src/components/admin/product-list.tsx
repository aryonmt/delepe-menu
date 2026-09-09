// src/components/admin/product-list.tsx
"use client";
import { useMemo, useState } from "react";
import { Edit, Plus, Search, Trash2 } from "lucide-react";
import type { ProductDto } from "@/application/dtos";
import { updateProductAvailabilityAction } from "@/app/admin/products/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { LIST_PAGE_SIZE } from "@/lib/constants";
import { toPersianDigits } from "@/lib/format/digits";
import { formatPrice } from "@/lib/format/price";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";
import { DeleteConfirm } from "./delete-confirm";
import { ProductForm } from "./product-form";

/**
 * Admin product list (docs/07). Search/filter/pagination are client-side over
 * the draft. Product drag-and-drop is intentionally ABSENT (owner decision):
 * ordering lives with categories only.
 */
export function ProductList() {
  const draft = useMenuDraftStore((s) => s.draft);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
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

  const filteredProducts = useMemo(() => {
    if (!draft) return [];
    let rows: ProductDto[] = [];
    for (const category of draft.categories) {
      rows = rows.concat(category.products);
      for (const child of category.children) {
        rows = rows.concat(child.products);
      }
    }
    if (catFilter !== "all") {
      rows = rows.filter((p) => p.categoryId === catFilter);
    }
    const query = search.trim();
    if (query) {
      rows = rows.filter((p) => p.name.includes(query));
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
        {paginated.map((product) => (
          <ProductRow
            key={product.id}
            product={product}
            onEdit={() => openEditor(product)}
            onAvailabilityReverted={() => undefined}
            clearDirty={clearDirty}
          />
        ))}
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

type RowProps = {
  product: ProductDto;
  onEdit: () => void;
  onAvailabilityReverted: () => void;
  clearDirty: () => void;
};

function ProductRow({ product, onEdit, clearDirty }: RowProps) {
  const updateAvailability = useMenuDraftStore((s) => s.updateProductAvailability);

  const handleToggle = (checked: boolean) => {
    updateAvailability(product.id, checked);
    void updateProductAvailabilityAction(product.id, checked).then((result) => {
      if (result.ok) {
        clearDirty();
        return;
      }
      updateAvailability(product.id, !checked);
      toast.error(result.error.fa);
    });
  };

  return (
    <div
      data-testid={`admin-product-row-${product.name}`}
      className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card mb-2"
    >
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate" data-testid="admin-product-name">
          {product.name}
        </p>
        <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
      </div>
      <Switch
        checked={product.isAvailable}
        onCheckedChange={handleToggle}
        aria-label={strings.admin.available}
      />
      <Button
        variant="ghost"
        size="icon"
        aria-label={strings.admin.editProduct}
        data-testid="edit-product"
        onClick={onEdit}
      >
        <Edit className="h-4 w-4" />
      </Button>
      <DeleteConfirm product={product}>
        <Button
          variant="ghost"
          size="icon"
          aria-label={strings.admin.deleteProduct}
          data-testid="delete-product"
          className="text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </DeleteConfirm>
    </div>
  );
}