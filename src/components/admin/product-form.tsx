// src/components/admin/product-form.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import type { MediaDto, ProductDto, UploadMediaResult } from "@/application/dtos";
import { createProductSchema } from "@/application/schemas";
import {
  createProductAction,
  deleteMediaAction,
  updateProductAction,
} from "@/app/admin/products/_actions";
import { Button } from "@/components/ui/button";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { PREVIEW_PANEL_WIDTH_PX } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";
import { ProductFormFields } from "./product-form-fields";
import {
  type FormInput,
  type FormOutput,
  provisionalProduct,
} from "./product-form-draft";
import { UploadEditor } from "./upload-editor";

type Props = { product: ProductDto | null; onClose: () => void };

export function ProductForm({ product, onClose }: Props) {
  const draft = useMenuDraftStore((s) => s.draft);
  const upsertProduct = useMenuDraftStore((s) => s.upsertProduct);
  const removeProduct = useMenuDraftStore((s) => s.removeProduct);
  const beginEditSession = useMenuDraftStore((s) => s.beginEditSession);
  const cancelEditSession = useMenuDraftStore((s) => s.cancelEditSession);
  const commitEditSession = useMenuDraftStore((s) => s.commitEditSession);

  const [tempId] = useState(() => `draft-${Math.random().toString(36).slice(2)}`);
  const [mediaDto, setMediaDto] = useState<MediaDto | null>(product?.media ?? null);
  const pendingMediaRef = useRef<string | null>(null);
  const isEdit = product !== null;
  const categories = useMemo(() => draft?.categories ?? [], [draft]);

  useEffect(() => {
    beginEditSession();
    return () => {
      cancelEditSession();
    };
  }, [beginEditSession, cancelEditSession]);

  useEffect(() => {
    return () => {
      const orphan = pendingMediaRef.current;
      if (orphan) void deleteMediaAction(orphan);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty: rhfDirty },
    control,
    setValue,
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price,
      discountedPrice: product?.discountedPrice ?? undefined,
      discountActive: product?.discountActive ?? false,
      isAvailable: product?.isAvailable ?? true,
      badges: product?.badges ?? [],
      categoryId: product?.categoryId ?? "",
      variants: (product?.variants ?? []).map((v) => ({
        name: v.name,
        price: v.price,
        discountedPrice: v.discountedPrice ?? undefined,
        discountActive: v.discountActive,
        isAvailable: v.isAvailable !== false,
      })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const values = useWatch({ control });
  const watchedDescription = values?.description ?? "";
  const watchedPrice = useWatch({ control, name: "price" });
  const watchedDiscountActive = useWatch({ control, name: "discountActive" });

  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  useEffect(() => {
    setValue("categoryId", categoryId);
  }, [categoryId, setValue]);

  const parentCategory = useMemo(
    () =>
      categories.find(
        (c) => c.id === categoryId || c.children.some((ch) => ch.id === categoryId),
      ) ?? null,
    [categories, categoryId],
  );
  const selectedParent =
    categories.find((c) => c.id === parentCategory?.id) ?? null;
  const childValue =
    selectedParent && selectedParent.children.length > 0 ? categoryId : "";

  const lastJson = useRef("");
  const baseMedia = product?.media ?? null;
  useEffect(() => {
    if (!values) return;
    const mediaChanged = mediaDto !== baseMedia;
    if (!rhfDirty && !mediaChanged) return;
    const json = JSON.stringify({ values, mediaId: mediaDto?.id ?? null });
    if (json === lastJson.current) return;
    lastJson.current = json;
    upsertProduct(provisionalProduct(product, tempId, values, mediaDto));
  }, [values, mediaDto, rhfDirty, baseMedia, product, tempId, upsertProduct]);

  const onUploadComplete = (result: UploadMediaResult) => {
    const previous = pendingMediaRef.current;
    if (previous && previous !== result.mediaId) {
      void deleteMediaAction(previous);
    }
    pendingMediaRef.current = result.mediaId;
    setMediaDto({
      id: result.mediaId,
      dominantColor: result.dominantColor,
      width: result.width,
      height: result.height,
    });
  };

  const handleCancel = () => {
    cancelEditSession();
    onClose();
  };

  const onSubmit = async (data: FormOutput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("categoryId", data.categoryId);
    formData.append("price", String(data.price));
    if (data.discountedPrice !== undefined && data.discountedPrice !== null) {
      formData.append("discountedPrice", String(data.discountedPrice));
    }
    if (data.discountActive) formData.append("discountActive", "on");
    if (data.isAvailable) formData.append("isAvailable", "on");
    for (const badge of data.badges) formData.append("badges", badge);
    for (const variant of data.variants) {
      if (variant.name && variant.price) {
        formData.append("variants", JSON.stringify(variant));
      }
    }
    if (mediaDto) formData.append("mediaId", mediaDto.id);
    if (product) formData.append("id", product.id);

    const action = isEdit ? updateProductAction : createProductAction;
    const result = await action(null, formData);
    if (result.ok) {
      pendingMediaRef.current = null;
      if (!isEdit) removeProduct(tempId);
      upsertProduct(result.data);
      commitEditSession();
      toast.success(isEdit ? strings.admin.productUpdated : strings.admin.productCreated);
      onClose();
      return;
    }
    toast.error(result.error.fa);
  };

  return (
    <Dialog.Root
      modal={false}
      open
      onOpenChange={(open) => {
        if (!open) handleCancel();
      }}
    >
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed bottom-0 start-0 end-0 top-14 z-[55] bg-black/50 md:end-[380px]"
          data-preview-gap={PREVIEW_PANEL_WIDTH_PX}
        />
        <Dialog.Content
          className="fixed bottom-0 start-0 top-14 z-[70] w-full max-w-md overflow-y-auto border-e border-border bg-card p-6 shadow-xl md:start-64"
          onPointerDownOutside={(event) => event.preventDefault()}
          onInteractOutside={(event) => event.preventDefault()}
          onFocusOutside={(event) => event.preventDefault()}
        >
          <div className="mb-6 flex items-center justify-between">
            <Dialog.Title className="text-xl font-bold">
              {isEdit ? strings.admin.editProduct : strings.admin.newProduct}
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label={strings.admin.cancel}>
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <form
            onSubmit={(event) => {
              void handleSubmit(onSubmit)(event);
            }}
            className="space-y-4"
          >
            <UploadEditor
              currentMediaId={mediaDto?.id ?? null}
              onUploadComplete={onUploadComplete}
              onRemove={() => setMediaDto(null)}
            />
            <ProductFormFields
              register={register}
              control={control}
              errors={errors}
              setValue={setValue}
              fields={fields}
              append={append}
              remove={remove}
              categories={categories}
              setCategoryId={setCategoryId}
              parentCategory={parentCategory}
              selectedParent={selectedParent}
              childValue={childValue}
              watchedDescription={watchedDescription}
              watchedPrice={watchedPrice}
              watchedDiscountActive={watchedDiscountActive}
            />
            <Button type="submit" className="w-full">
              {strings.admin.save}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
