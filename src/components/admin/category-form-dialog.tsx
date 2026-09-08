// src/components/admin/category-form-dialog.tsx
"use client";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { CategoryDto } from "@/application/dtos";
import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/admin/categories/_actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";

export type CategoryDialogState =
  | { mode: "create-top" }
  | { mode: "create-child"; parentId: string }
  | { mode: "edit"; category: CategoryDto }
  | null;

type Props = {
  state: CategoryDialogState;
  onClose: () => void;
};

function dialogKey(state: Exclude<CategoryDialogState, null>): string {
  if (state.mode === "edit") return `edit-${state.category.id}`;
  if (state.mode === "create-child") return `child-${state.parentId}`;
  return "create-top";
}

function initialParentId(state: Exclude<CategoryDialogState, null>): string {
  if (state.mode === "create-child") return state.parentId;
  if (state.mode === "edit") return state.category.parentId ?? "";
  return "";
}

/** Add/edit dialog for categories (docs/07): name + parent (top-level only). */
export function CategoryFormDialog({ state, onClose }: Props) {
  if (!state) return null;
  return <CategoryFormBody key={dialogKey(state)} state={state} onClose={onClose} />;
}

function CategoryFormBody({
  state,
  onClose,
}: {
  state: Exclude<CategoryDialogState, null>;
  onClose: () => void;
}) {
  const draft = useMenuDraftStore((s) => s.draft);
  const upsertCategory = useMenuDraftStore((s) => s.upsertCategory);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
  const [name, setName] = useState(state.mode === "edit" ? state.category.name : "");
  const [parentId, setParentId] = useState(initialParentId(state));
  const [saving, setSaving] = useState(false);
  const topLevels = draft?.categories ?? [];
  const parentLocked = state.mode === "create-child";

  const submit = async () => {
    const trimmed = name.trim();
    if (trimmed === "") return;
    setSaving(true);
    const formData = new FormData();
    formData.append("name", trimmed);
    formData.append("parentId", parentId);
    if (state.mode === "edit") formData.append("id", state.category.id);
    const action =
      state.mode === "edit" ? updateCategoryAction : createCategoryAction;
    const result = await action(null, formData);
    setSaving(false);
    if (result.ok) {
      upsertCategory(result.data);
      clearDirty();
      toast.success(strings.admin.categorySaved);
      onClose();
      return;
    }
    toast.error(result.error.fa);
  };

  return (
    <Dialog.Root open onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-card border border-border bg-card p-6 shadow-lift focus:outline-none">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-xl font-bold">
              {state.mode === "edit"
                ? strings.admin.editCategory
                : strings.admin.newCategory}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={strings.admin.cancel}>
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="category-name">{strings.admin.categoryName}</Label>
              <Input
                id="category-name"
                value={name}
                maxLength={60}
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category-parent">{strings.admin.parentCategorySelect}</Label>
              <Select
                value={parentId === "" ? "__none__" : parentId}
                disabled={parentLocked}
                onValueChange={(value) =>
                  setParentId(value === "__none__" ? "" : value)
                }
              >
                <SelectTrigger id="category-parent">
                  <SelectValue placeholder={strings.admin.noParent} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{strings.admin.noParent}</SelectItem>
                  {topLevels.map((top) => (
                    <SelectItem key={top.id} value={top.id}>
                      {top.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" disabled={saving} aria-busy={saving}>
              {strings.admin.save}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}