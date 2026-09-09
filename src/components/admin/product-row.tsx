"use client";
import { ChevronDown, ChevronUp, Edit, Trash2 } from "lucide-react";
import type { ProductDto } from "@/application/dtos";
import { updateProductAvailabilityAction } from "@/app/admin/products/_actions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { formatPrice } from "@/lib/format/price";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";
import { DeleteConfirm } from "./delete-confirm";

type Props = {
  product: ProductDto;
  onEdit: () => void;
  clearDirty: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
};

export function ProductRow({ product, onEdit, clearDirty, onMoveUp, onMoveDown }: Props) {
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
      {onMoveUp || onMoveDown ? (
        <div className="flex shrink-0">
          {onMoveUp ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={strings.admin.moveProductUp}
              data-testid={`product-move-up-${product.name}`}
              onClick={onMoveUp}
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          ) : null}
          {onMoveDown ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label={strings.admin.moveProductDown}
              data-testid={`product-move-down-${product.name}`}
              onClick={onMoveDown}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      ) : null}
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
