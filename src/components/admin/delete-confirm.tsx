// src/components/admin/delete-confirm.tsx
"use client";
import { useState } from "react";
import type { ProductDto } from "@/application/dtos";
import { deleteProductAction } from "@/app/admin/products/_actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";

type Props = { product: ProductDto; children: React.ReactNode };

export function DeleteConfirm({ product, children }: Props) {
  const [open, setOpen] = useState(false);
  const removeProduct = useMenuDraftStore((s) => s.removeProduct);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);

  const handleDelete = async () => {
    const formData = new FormData();
    formData.append("id", product.id);
    const res = await deleteProductAction(null, formData);
    if (res.ok) {
      removeProduct(product.id);
      clearDirty();
      toast.success(strings.admin.productDeleted);
      setOpen(false);
      return;
    }
    toast.error(res.error.fa);
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{strings.admin.deleteConfirmTitle}</AlertDialogTitle>
          <AlertDialogDescription>
            {strings.admin.deleteConfirmDesc.replace("{name}", product.name)}
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
  );
}