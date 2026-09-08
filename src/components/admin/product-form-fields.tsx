"use client";
import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch, type UseFieldArrayReturn } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import type { CategoryDto } from "@/application/dtos";
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
import { toPersianDigits } from "@/lib/format/digits";
import { formatPrice } from "@/lib/format/price";
import { strings } from "@/lib/fa/strings";
import type { FormInput, FormOutput } from "./product-form-draft";
import { parseDigitInput } from "./product-form-draft";

const BADGES = ["POPULAR", "NEW", "SPICY", "VEGETARIAN"] as const;

type Props = {
  register: UseFormRegister<FormInput>;
  control: Control<FormInput, unknown, FormOutput>;
  errors: FieldErrors<FormInput>;
  setValue: UseFormSetValue<FormInput>;
  fields: UseFieldArrayReturn<FormInput, "variants">["fields"];
  append: UseFieldArrayReturn<FormInput, "variants">["append"];
  remove: UseFieldArrayReturn<FormInput, "variants">["remove"];
  categories: CategoryDto[];
  setCategoryId: (id: string) => void;
  parentCategory: CategoryDto | null;
  selectedParent: CategoryDto | null;
  childValue: string;
  hasVariants: boolean;
  watchedDescription: string;
  watchedPrice: unknown;
  watchedDiscountActive: boolean | undefined;
};

export function ProductFormFields({
  register,
  control,
  errors,
  setValue,
  fields,
  append,
  remove,
  categories,
  setCategoryId,
  parentCategory,
  selectedParent,
  childValue,
  hasVariants,
  watchedDescription,
  watchedPrice,
  watchedDiscountActive,
}: Props) {
  const badges = useWatch({ control, name: "badges" }) ?? [];

  const toggleBadge = (badge: (typeof BADGES)[number]) => {
    const next = badges.includes(badge)
      ? badges.filter((item) => item !== badge)
      : [...badges, badge];
    setValue("badges", next, { shouldDirty: true, shouldValidate: true });
  };

  return (
    <>
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
          <Select
            value={parentCategory?.id ?? ""}
            onValueChange={(value) => {
              const parent = categories.find((c) => c.id === value);
              if (!parent) return;
              setCategoryId(
                parent.children.length > 0
                  ? (parent.children[0]?.id ?? "")
                  : parent.id,
              );
            }}
          >
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
        <p className="text-xs text-destructive">{errors.categoryId.message as string}</p>
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
        <div className="space-y-3 rounded-lg border border-border p-3">
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
              <Label htmlFor="pf-discounted-price">{strings.admin.discountedPrice}</Label>
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
          {BADGES.map((badge) => {
            const pressed = badges.includes(badge);
            return (
              <button
                key={badge}
                type="button"
                aria-pressed={pressed}
                data-badge-toggle={badge}
                onClick={() => toggleBadge(badge)}
                className={`rounded-full border px-3 py-1 text-xs font-bold transition-colors ${
                  pressed
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-line bg-card-2/60 text-muted-foreground"
                }`}
              >
                {strings.badges[badge]}
              </button>
            );
          })}
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
    </>
  );
}
