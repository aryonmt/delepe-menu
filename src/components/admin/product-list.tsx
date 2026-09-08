// src/components/admin/product-list.tsx
"use client";
import { useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Edit, GripVertical, Plus, Search, Trash2 } from "lucide-react";
import type { ProductDto } from "@/application/dtos";
import {
  reorderProductsAction,
  updateProductAvailabilityAction,
} from "@/app/admin/products/_actions";
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

type RowProps = {
  product: ProductDto;
  canReorder: boolean;
  onEdit: (product: ProductDto) => void;
};

function SortableRow({ product, canReorder, onEdit }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: product.id, disabled: !canReorder });
  const updateAvailability = useMenuDraftStore((s) => s.updateProductAvailability);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);

  const handleToggle = (checked: boolean) => {
    updateAvailability(product.id, checked);
    void updateProductAvailabilityAction(product.id, checked).then((res) => {
      if (res.ok) {
        clearDirty();
        return;
      }
      updateAvailability(product.id, !checked);
      toast.error(res.error.fa);
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-testid={`admin-product-row-${product.name}`}
      className="flex items-center gap-4 p-3 border border-border rounded-lg bg-card mb-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        disabled={!canReorder}
        aria-label={strings.admin.reorderAria}
        data-testid="reorder-handle"
        className="cursor-grab text-muted-foreground disabled:cursor-not-allowed disabled:opacity-30"
      >
        <GripVertical className="h-5 w-5" />
      </button>
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
        onClick={() => onEdit(product)}
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

export function ProductList() {
  const draft = useMenuDraftStore((s) => s.draft);
  const reorderStore = useMenuDraftStore((s) => s.reorderProducts);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
      for (const child of category.children) rows = rows.concat(child.products);
    }
    if (catFilter !== "all") {
      rows = rows.filter((p) => p.categoryId === catFilter);
    }
    if (search.trim()) {
      rows = rows.filter((p) => p.name.includes(search.trim()));
    }
    return rows.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [draft, catFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / LIST_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filteredProducts.slice(
    (currentPage - 1) * LIST_PAGE_SIZE,
    currentPage * LIST_PAGE_SIZE,
  );

  const selectedTop = draft?.categories.find((c) => c.id === catFilter);
  const canReorder =
    catFilter !== "all" && search.trim() === "" && !(selectedTop && selectedTop.children.length > 0);

  const handleDragEnd = (event: DragEndEvent) => {
    if (!canReorder) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const previousIds = filteredProducts.map((p) => p.id);
    const from = previousIds.indexOf(String(active.id));
    const to = previousIds.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    const nextIds = arrayMove(previousIds, from, to);
    reorderStore(catFilter, nextIds);
    void reorderProductsAction(catFilter, nextIds).then((res) => {
      if (res.ok) {
        clearDirty();
        return;
      }
      reorderStore(catFilter, previousIds);
      toast.error(res.error.fa);
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
            onChange={(e) => {
              setSearch(e.target.value);
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
          <SelectTrigger className="w-full md:w-[220px]">
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
        <Button onClick={() => setIsCreating(true)} className="w-full md:w-auto">
          <Plus className="h-4 w-4 me-2" />
          {strings.admin.newProduct}
        </Button>
      </div>

      {!canReorder && (
        <p className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded-lg">
          {strings.admin.reorderHint}
        </p>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={paginated.map((p) => p.id)} strategy={verticalListSortingStrategy}>
          <div>
            {paginated.map((product) => (
              <SortableRow
                key={product.id}
                product={product}
                canReorder={canReorder}
                onEdit={setEditing}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {filteredProducts.length === 0 && (
        <p className="text-center text-muted-foreground py-8">{strings.admin.noResults}</p>
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