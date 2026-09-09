// src/components/admin/category-tree.tsx
"use client";
import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { CategoryDto } from "@/application/dtos";
import {
  deleteCategoryAction,
  reorderCategoriesAction,
} from "@/app/admin/categories/_actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";
import {
  createCategoryCollision,
  createCategoryKeyboardCoordinates,
} from "./category-collision";
import { CategoryRow } from "./category-row";
import {
  CategoryFormDialog,
  type CategoryDialogState,
} from "./category-form-dialog";

export function CategoryTree() {
  const draft = useMenuDraftStore((s) => s.draft);
  const removeCategory = useMenuDraftStore((s) => s.removeCategory);
  const reorderStore = useMenuDraftStore((s) => s.reorderCategories);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
  const [dialog, setDialog] = useState<CategoryDialogState>(null);
  const [deleteTarget, setDeleteTarget] = useState<CategoryDto | null>(null);
  const categories = draft?.categories ?? [];
  const topIds = categories.map((category) => category.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: createCategoryKeyboardCoordinates(topIds),
    }),
  );

  const requestDelete = async (category: CategoryDto) => {
    const blocked = category.products.length > 0 || category.children.length > 0;
    if (blocked) {
      toast.error(strings.errors.domain.CATEGORY_NOT_EMPTY);
      return;
    }
    setDeleteTarget(category);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const formData = new FormData();
    formData.append("id", deleteTarget.id);
    const result = await deleteCategoryAction(null, formData);
    if (result.ok) {
      removeCategory(deleteTarget.id);
      clearDirty();
      toast.success(strings.admin.categoryDeleted);
      setDeleteTarget(null);
      return;
    }
    toast.error(result.error.fa);
  };

  const applyReorder = (parentId: string | null, previousIds: string[], activeId: string, overId: string) => {
    const from = previousIds.indexOf(activeId);
    const to = previousIds.indexOf(overId);
    if (from < 0 || to < 0) return;
    const nextIds = arrayMove(previousIds, from, to);
    reorderStore(parentId, nextIds);
    void reorderCategoriesAction(parentId, nextIds).then((result) => {
      if (result.ok) {
        clearDirty();
        return;
      }
      reorderStore(parentId, previousIds);
      toast.error(result.error.fa);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const activeId = String(active.id);
    const overId = String(over.id);
    if (topIds.includes(activeId) && topIds.includes(overId)) {
      applyReorder(null, topIds, activeId, overId);
      return;
    }
    for (const category of categories) {
      const childIds = category.children.map((child) => child.id);
      if (childIds.includes(activeId) && childIds.includes(overId)) {
        applyReorder(category.id, childIds, activeId, overId);
        return;
      }
    }
  };

  if (!draft) return null;
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setDialog({ mode: "create-top" })}>
          <Plus className="h-4 w-4 me-2" />
          {strings.admin.newCategory}
        </Button>
      </div>

      {categories.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-muted-foreground">
          {strings.admin.categoriesEmpty}
        </p>
      ) : (
      <DndContext
        sensors={sensors}
        collisionDetection={createCategoryCollision(topIds)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="space-y-3">
            {categories.map((category, index) => (
              <li key={category.id} className="space-y-2">
                <CategoryRow
                  category={category}
                  depth={0}
                  onEdit={(c) => setDialog({ mode: "edit", category: c })}
                  onDelete={(c) => void requestDelete(c)}
                  onAddChild={(c) =>
                    setDialog({ mode: "create-child", parentId: c.id })
                  }
                  onMoveUp={
                    index > 0
                      ? () => {
                          const overId = categories[index - 1]?.id;
                          if (overId) applyReorder(null, topIds, category.id, overId);
                        }
                      : undefined
                  }
                  onMoveDown={
                    index < categories.length - 1
                      ? () => {
                          const overId = categories[index + 1]?.id;
                          if (overId) applyReorder(null, topIds, category.id, overId);
                        }
                      : undefined
                  }
                />
                <SortableContext
                  items={category.children.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-2">
                    {category.children.map((child, childIndex) => (
                      <CategoryRow
                        key={child.id}
                        category={child}
                        depth={1}
                        onEdit={(c) => setDialog({ mode: "edit", category: c })}
                        onDelete={(c) => void requestDelete(c)}
                        onMoveUp={
                          childIndex > 0
                            ? () => {
                                const childIds = category.children.map((item) => item.id);
                                const overId = childIds[childIndex - 1];
                                if (overId) {
                                  applyReorder(category.id, childIds, child.id, overId);
                                }
                              }
                            : undefined
                        }
                        onMoveDown={
                          childIndex < category.children.length - 1
                            ? () => {
                                const childIds = category.children.map((item) => item.id);
                                const overId = childIds[childIndex + 1];
                                if (overId) {
                                  applyReorder(category.id, childIds, child.id, overId);
                                }
                              }
                            : undefined
                        }
                      />
                    ))}
                  </ul>
                </SortableContext>
              </li>
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      )}

      <CategoryFormDialog state={dialog} onClose={() => setDialog(null)} />

      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{strings.admin.deleteCategory}</AlertDialogTitle>
            <AlertDialogDescription>
            {strings.admin.deleteCategoryDesc.replace("{name}", deleteTarget?.name ?? "")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{strings.admin.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => void handleDelete()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {strings.admin.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
