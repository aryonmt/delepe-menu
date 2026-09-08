// src/components/admin/product-form.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Plus, Trash2, X } from "lucide-react";
import type { ProductDto } from "@/application/dtos";
import { createProductSchema } from "@/application/schemas";
import {
  createProductAction,
  deleteMediaAction,
  updateProductAction,
} from "@/app/admin/products/_actions";
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
import { Switch } from "@/components/ui/switch";
import { useMenuDraftStore } from "@/hooks/use-menu-draft-store";
import { toAsciiDigits } from "@/lib/format/digits";
import { toPersianDigits } from "@/lib/format/digits";
import { formatPrice } from "@/lib/format/price";
import { strings } from "@/lib/fa/strings";
import { toast } from "sonner";
import { UploadEditor } from "./upload-editor";

type FormInput = z.input<typeof createProductSchema>;
type FormOutput = z.output<typeof createProductSchema>;

type Props = { product: ProductDto | null; onClose: () => void };

/** Normalize FA/EN digit text to a number before Zod sees it (docs/03). */
function parseDigitInput(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(toAsciiDigits(String(value)));
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function ProductForm({ product, onClose }: Props) {
  const draft = useMenuDraftStore((s) => s.draft);
  const upsert = useMenuDraftStore((s) => s.upsertProduct);
  const clearDirty = useMenuDraftStore((s) => s.clearDirty);
  const [mediaId, setMediaId] = useState<string | null>(product?.media?.id ?? null);
  const pendingMediaRef = useRef<string | null>(null);
  const isEdit = Boolean(product);
  const categories = useMemo(() => draft?.categories ?? [], [draft]);

  /* Orphan cleanup (docs/07 step 6): an upload never attached is deleted. */
  useEffect(() => {
    return () => {
      const orphan = pendingMediaRef.current;
      if (orphan) void deleteMediaAction(orphan);
    };
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
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
      variants: (product?.variants ?? []).map((v) => ({ name: v.name, price: v.price })),
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const variants = useWatch({ control, name: "variants" });
  const watchedBadges = useWatch({ control, name: "badges" }) ?? [];
  const watchedDiscountActive = useWatch({ control, name: "discountActive" });
  const watchedPrice = useWatch({ control, name: "price" });
  const watchedDescription = useWatch({ control, name: "description" }) ?? "";
  const [categoryId, setCategoryId] = useState(product?.categoryId ?? "");
  const hasVariants = Boolean(variants && variants.length > 0);

  useEffect(() => {
    setValue("categoryId", categoryId);
  }, [categoryId, setValue]);

  useEffect(() => {
    if (!hasVariants) return;
    const prices = (variants ?? [])
      .map((v) => Number(v?.price) || 0)
      .filter((p) => p > 0);
    setValue("price", prices.length > 0 ? Math.min(...prices) : undefined);
  }, [hasVariants, variants, setValue]);

  const parentCategory = useMemo(
    () =>
      categories.find(
        (c) => c.id === categoryId || c.children.some((ch) => ch.id === categoryId),
      ) ?? null,
    [categories, categoryId],
  );
  const selectedParent = categories.find((c) => c.id === parentCategory?.id) ?? null;
  const childValue =
    selectedParent && selectedParent.children.length > 0 ? categoryId : "";

  const onParentChange = (value: string) => {
    const parent = categories.find((c) => c.id === value);
    if (!parent) return;
    setCategoryId(
      parent.children.length > 0 ? (parent.children[0]?.id ?? "") : parent.id,
    );
  };

  const toggleBadge = (badge: FormOutput["badges"][number]) => {
    const next = watchedBadges.includes(badge)
      ? watchedBadges.filter((b) => b !== badge)
      : [...watchedBadges, badge];
    setValue("badges", next);
  };

  const onUploadComplete = (id: string) => {
    const previous = pendingMediaRef.current;
    if (previous && previous !== id) void deleteMediaAction(previous);
    pendingMediaRef.current = id;
    setMediaId(id);
  };

  const onSubmit = async (data: FormOutput) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) formData.append("description", data.description);
    formData.append("categoryId", data.categoryId);
    if (data.price !== undefined) formData.append("price", String(data.price));
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
    if (mediaId) formData.append("mediaId", mediaId);
    if (product) formData.append("id", product.id);

    const action = isEdit ? updateProductAction : createProductAction;
    const res = await action(null, formData);
    if (res.ok) {
      pendingMediaRef.current = null;
      upsert(res.data);
      clearDirty();
      toast.success(isEdit ? strings.admin.productUpdated : strings.admin.productCreated);
      onClose();
      return;
    }
    toast.error(res.error.fa);
  };

  return (
    <Dialog.Root open onOpenChange={() => onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed inset-y-0 end-0 w-full max-w-md bg-card border-s border-border z-50 overflow-y-auto p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
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
              currentMediaId={mediaId}
              onUploadComplete={onUploadComplete}
              onRemove={() => setMediaId(null)}
            />
            <div className="space-y-2">
              <Label htmlFor="pf-name">{strings.admin.name}</Label>
              <Input id="pf-name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pf-description">{strings.admin.description}</Label>
              <Input id="pf-description" maxLength={500} {...register("description")} />
              <p className="text-xs text-muted-foreground">
                {toPersianDigits(watchedDescription.length)} / {toPersianDigits(500)}{" "}
                {strings.admin.descriptionCounter}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{strings.admin.parentCategory}</Label>
                <Select value={parentCategory?.id ?? ""} onValueChange={onParentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={strings.admin.selectPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedParent && selectedParent.children.length > 0 && (
                <div className="space-y-2">
                  <Label>{strings.admin.childCategory}</Label>
                  <Select value={childValue} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder={strings.admin.selectPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedParent.children.map((child) => (
                        <SelectItem key={child.id} value={child.id}>
                          {child.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message as string}
              </p>
            )}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="pf-price">{strings.admin.price}</Label>
                {hasVariants && (
                  <span className="text-xs text-muted-foreground">
                    {strings.admin.systemMaintainedPrice}
                  </span>
                )}
              </div>
              <Input
                id="pf-price"
                type="text"
                inputMode="numeric"
                disabled={hasVariants}
                {...register("price", { setValueAs: parseDigitInput })}
              />
              {typeof watchedPrice === "number" && watchedPrice > 0 && (
                <p className="text-xs text-muted-foreground">{formatPrice(watchedPrice)}</p>
              )}
              {errors.price && (
                <p className="text-xs text-destructive">{errors.price.message as string}</p>
              )}
            </div>
            {!hasVariants && (
              <div className="space-y-3 p-3 border border-border rounded-lg">
                <div className="flex items-center gap-2">
                  <Controller
                    name="discountActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        id="pf-discount-active"
                        checked={Boolean(field.value)}
                        onCheckedChange={field.onChange}
                      />
                    )}
                  />
                  <Label htmlFor="pf-discount-active">{strings.admin.discountActive}</Label>
                </div>
                {watchedDiscountActive && (
                  <div className="space-y-2">
                    <Label htmlFor="pf-discounted-price">
                      {strings.admin.discountedPrice}
                    </Label>
                    <Input
                      id="pf-discounted-price"
                      type="text"
                      inputMode="numeric"
                      {...register("discountedPrice", { setValueAs: parseDigitInput })}
                    />
                    {errors.discountedPrice && (
                      <p className="text-xs text-destructive">
                        {errors.discountedPrice.message as string}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label>{strings.admin.badges}</Label>
              <div className="flex flex-wrap gap-2">
                {(["POPULAR", "NEW", "SPICY", "VEGETARIAN"] as const).map((badge) => (
                  <button
                    key={badge}
                    type="button"
                    aria-pressed={watchedBadges.includes(badge)}
                    onClick={() => toggleBadge(badge)}
                    className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                      watchedBadges.includes(badge)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-line bg-card-2/60 text-muted-foreground"
                    }`}
                  >
                    {strings.badges[badge]}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>{strings.admin.variants}</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ name: "", price: 0 })}
                >
                  <Plus className="h-3 w-3 me-1" />
                  {strings.admin.addVariant}
                </Button>
              </div>
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2">
                  <Input
                    placeholder={strings.admin.variantName}
                    {...register(`variants.${index}.name`)}
                  />
                  <Input
                    placeholder={strings.admin.variantPrice}
                    type="text"
                    inputMode="numeric"
                    {...register(`variants.${index}.price`, { setValueAs: parseDigitInput })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={strings.admin.delete}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Controller
                name="isAvailable"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="pf-is-available"
                    checked={Boolean(field.value)}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="pf-is-available">{strings.admin.available}</Label>
            </div>
            <Button type="submit" className="w-full">
              {strings.admin.save}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}