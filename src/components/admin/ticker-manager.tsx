// src/components/admin/ticker-manager.tsx
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
import { GripVertical, Plus, X } from "lucide-react";
import type { CategoryDto, ProductDto } from "@/application/dtos";
import { updateTickerAction } from "@/app/admin/settings/_actions";
import { Button } from "@/components/ui/button";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { mediaUrl } from "@/lib/media-url";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";

type Row = { product: ProductDto; categoryName: string };

const EMPTY_CATEGORIES: CategoryDto[] = [];

function flattenProducts(categories: CategoryDto[]): Row[] {
  const out: Row[] = [];
  for (const category of categories) {
    for (const product of category.products) {
      out.push({ product, categoryName: category.name });
    }
    for (const child of category.children) {
      for (const product of child.products) {
        out.push({ product, categoryName: `${category.name} / ${child.name}` });
      }
    }
  }
  return out;
}

function SortableRow({
  row,
  onRemove,
}: {
  row: Row;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: row.product.id,
  });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-lg border border-border bg-card p-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={strings.admin.reorderAria}
        className="cursor-grab text-muted-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span
        aria-hidden="true"
        className="h-10 w-10 shrink-0 rounded-full border border-line bg-center bg-cover"
        style={{
          backgroundImage: row.product.media
            ? `url(${mediaUrl(row.product.media.id, 320)})`
            : undefined,
          backgroundColor: row.product.media?.dominantColor ?? "var(--card-2)",
        }}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-foreground">
          {row.product.name}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {row.categoryName}
          {!row.product.isAvailable ? ` · ${strings.admin.unavailable}` : ""}
        </span>
      </span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={strings.admin.delete}
        onClick={onRemove}
      >
        <X className="h-4 w-4 text-destructive" />
      </Button>
    </li>
  );
}

export function TickerManager() {
  const savedVersion = useMenuDraftStore((s) => s.savedVersion);
  return <TickerEditor key={savedVersion} />;
}

function TickerEditor() {
  const draft = useMenuDraftStore((s) => s.draft);
  const updateSettings = useMenuDraftStore((s) => s.updateSettings);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
  const categories = draft?.categories ?? EMPTY_CATEGORIES;
  const all = useMemo(() => flattenProducts(categories), [categories]);
  const byId = useMemo(() => new Map(all.map((row) => [row.product.id, row])), [all]);
  const [ids, setIds] = useState(() => {
    const snapshot = useMenuDraftStore.getState().draft;
    const map = new Map(
      flattenProducts(snapshot?.categories ?? []).map((row) => [row.product.id, row] as const),
    );
    return snapshot?.settings.tickerProductIds?.filter((id) => map.has(id)) ?? [];
  });
  const [pick, setPick] = useState("");
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const applyIds = (next: string[]) => {
    setIds(next);
    const current = useMenuDraftStore.getState().draft?.settings;
    if (!current) return;
    updateSettings({ ...current, tickerProductIds: next });
  };

  const rows = ids
    .map((id) => byId.get(id))
    .filter((row): row is Row => Boolean(row));
  const availableToAdd = all.filter((row) => !ids.includes(row.product.id));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    applyIds(
      arrayMove(ids, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))),
    );
  };

  const save = async () => {
    setSaving(true);
    const result = await updateTickerAction(ids);
    setSaving(false);
    if (result.ok) {
      updateSettings(result.data);
      clearDirty();
      toast.success(strings.admin.tickerSaved);
      return;
    }
    toast.error(result.error.fa);
  };

  return (
    <section className="flex flex-col gap-4" aria-label={strings.admin.tickerTitle}>
      <h2 className="font-display text-section text-foreground">
        {strings.admin.tickerTitle}
      </h2>
      <p className="text-secondary text-muted-foreground">{strings.admin.tickerHint}</p>
      {rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-6 text-center text-secondary text-muted-foreground">
          {strings.admin.tickerEmpty}
        </p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {rows.map((row) => (
                <SortableRow
                  key={row.product.id}
                  row={row}
                  onRemove={() => applyIds(ids.filter((id) => id !== row.product.id))}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
      <div className="flex items-end gap-2">
        <label
          htmlFor="ticker-pick"
          className="flex min-w-0 flex-1 flex-col gap-1 text-secondary text-muted-foreground"
        >
          {strings.admin.tickerAdd}
          <select
            id="ticker-pick"
            value={pick}
            onChange={(event) => setPick(event.target.value)}
            className="min-h-11 rounded-lg border border-border bg-background px-3 text-body text-foreground"
          >
            <option value="">{strings.admin.tickerAddPlaceholder}</option>
            {availableToAdd.map((row) => (
              <option key={row.product.id} value={row.product.id}>
                {row.categoryName} — {row.product.name}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          variant="outline"
          disabled={!pick}
          onClick={() => {
            if (!pick) return;
            applyIds([...ids, pick]);
            setPick("");
          }}
        >
          <Plus className="h-4 w-4" />
          {strings.admin.tickerAdd}
        </Button>
      </div>
      <Button type="button" onClick={() => void save()} disabled={saving} aria-busy={saving}>
        {strings.admin.save}
      </Button>
    </section>
  );
}