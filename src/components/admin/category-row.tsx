"use client";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronDown, ChevronUp, GripVertical, Pencil, Plus, Trash2 } from "lucide-react";
import type { CategoryDto } from "@/application/dtos";
import { Button } from "@/components/ui/button";
import { strings } from "@/lib/fa/strings";

type Props = {
  category: CategoryDto;
  depth: 0 | 1;
  onEdit: (category: CategoryDto) => void;
  onDelete: (category: CategoryDto) => void;
  onAddChild?: (category: CategoryDto) => void;
  onMoveDown?: () => void;
  onMoveUp?: () => void;
};

export function CategoryRow({
  category,
  depth,
  onEdit,
  onDelete,
  onAddChild,
  onMoveDown,
  onMoveUp,
}: Props) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: category.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      data-depth={depth}
      data-testid={`category-row-${category.name}`}
      className={`flex items-center gap-3 rounded-lg border border-border bg-card p-3 ${
        depth === 1 ? "ms-8" : ""
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={strings.admin.reorderAria}
        data-testid="category-reorder-handle"
        className="cursor-grab text-muted-foreground"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      <span className="flex-1 min-w-0 truncate font-bold" data-testid="admin-category-name">
        {category.name}
      </span>
      {onMoveUp ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={strings.admin.moveCategoryUp}
          data-testid={`category-move-up-${category.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onMoveUp();
          }}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      ) : null}
      {onMoveDown ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={strings.admin.moveCategoryDown}
          data-testid={`category-move-down-${category.name}`}
          onClick={(event) => {
            event.stopPropagation();
            onMoveDown();
          }}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      ) : null}
      {onAddChild && (
        <Button
          variant="ghost"
          size="icon"
          aria-label={strings.admin.addChild}
          data-testid={`category-add-child-${category.name}`}
          onClick={() => onAddChild(category)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        aria-label={strings.admin.editCategory}
        data-testid="category-edit"
        onClick={() => onEdit(category)}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={strings.admin.deleteCategory}
        data-testid={`category-delete-${category.name}`}
        className="text-destructive"
        onClick={() => onDelete(category)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
