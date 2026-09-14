"use client";
import { useCallback } from "react";
import type {
  Control,
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from "react-hook-form";
import { Controller } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { strings } from "@/lib/fa/strings";
import { DiscountPercentFields } from "./discount-percent-fields";
import type { FormInput, FormOutput } from "./product-form-draft";
import { parseDigitInput } from "./product-form-draft";

type Props = {
  index: number;
  fieldId: string;
  register: UseFormRegister<FormInput>;
  control: Control<FormInput, unknown, FormOutput>;
  errors: FieldErrors<FormInput>;
  setValue: UseFormSetValue<FormInput>;
  discountActive: boolean;
  price: unknown;
  discountedPrice: number | null | undefined;
  onRemove: () => void;
};

export function ProductVariantFields({
  index,
  fieldId,
  register,
  control,
  errors,
  setValue,
  discountActive,
  price,
  discountedPrice,
  onRemove,
}: Props) {
  const variantErrors = errors.variants?.[index];
  const handleDiscountedPrice = useCallback(
    (value: number | null) => {
      setValue(`variants.${index}.discountedPrice`, value, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [index, setValue],
  );
  return (
    <div
      key={fieldId}
      className="space-y-3 rounded-lg border border-border p-3"
    >
      <div className="flex gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <Input
            placeholder={strings.admin.variantName}
            {...register(`variants.${index}.name`)}
          />
          {variantErrors?.name && (
            <p className="text-xs text-destructive">{variantErrors.name.message}</p>
          )}
        </div>
        <div className="w-32 space-y-1">
          <Input
            placeholder={strings.admin.variantPrice}
            type="text"
            inputMode="numeric"
            {...register(`variants.${index}.price`, { setValueAs: parseDigitInput })}
          />
          {variantErrors?.price && (
            <p className="text-xs text-destructive">{variantErrors.price.message}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={strings.admin.delete}
          onClick={onRemove}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Controller
          name={`variants.${index}.discountActive`}
          control={control}
          render={({ field }) => (
            <Switch
              id={`pf-v-disc-${index}`}
              checked={Boolean(field.value)}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor={`pf-v-disc-${index}`}>{strings.admin.variantDiscountActive}</Label>
      </div>
      {discountActive ? (
        <DiscountPercentFields
          id={`pf-v-disc-percent-${index}`}
          percentLabel={strings.admin.variantDiscountPercent}
          priceHintLabel={strings.admin.variantDiscountedPrice}
          price={price}
          discountedPrice={discountedPrice}
          error={variantErrors?.discountedPrice?.message}
          onDiscountedPriceChange={handleDiscountedPrice}
        />
      ) : null}
      <div className="flex items-center gap-2">
        <Controller
          name={`variants.${index}.isAvailable`}
          control={control}
          render={({ field }) => (
            <Switch
              id={`pf-v-avail-${index}`}
              checked={field.value !== false}
              onCheckedChange={field.onChange}
            />
          )}
        />
        <Label htmlFor={`pf-v-avail-${index}`}>{strings.admin.variantAvailable}</Label>
      </div>
    </div>
  );
}
