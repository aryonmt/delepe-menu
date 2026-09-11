import type { MediaDto, ProductDto } from "@/application/dtos";
import { createProductSchema } from "@/application/schemas";
import { toAsciiDigits } from "@/lib/format/digits";
import type { z } from "zod";

export type FormInput = z.input<typeof createProductSchema>;
export type FormOutput = z.output<typeof createProductSchema>;

/** Normalize FA/EN digit text to a number before Zod sees it (docs/03). */
export function parseDigitInput(value: unknown): number | undefined {
  if (value === "" || value === null || value === undefined) return undefined;
  const parsed = Number(toAsciiDigits(String(value)));
  return Number.isNaN(parsed) ? undefined : parsed;
}

/** Watched RHF values are partial until submit; preview still needs a ProductDto. */
export type DraftFormValues = {
  name?: string;
  description?: string | null;
  price?: number;
  discountedPrice?: number | null;
  discountActive?: boolean;
  isAvailable?: boolean;
  badges?: ProductDto["badges"];
  categoryId?: string;
  variants?: Array<
    | {
        name?: string;
        price?: number;
        discountedPrice?: number | null;
        discountActive?: boolean;
        isAvailable?: boolean;
      }
    | undefined
  >;
};

function draftVariants(tempId: string, values: DraftFormValues): ProductDto["variants"] {
  return (values.variants ?? [])
    .filter(
      (variant): variant is NonNullable<DraftFormValues["variants"]>[number] & {
        name: string;
        price: number;
      } => Boolean(variant?.name) && (variant?.price ?? 0) > 0,
    )
    .map((variant, index) => ({
      id: `${tempId}-v${index}`,
      name: variant.name,
      price: variant.price,
      discountedPrice: variant.discountedPrice ?? null,
      discountActive: Boolean(variant.discountActive),
      isAvailable: variant.isAvailable ?? true,
      sortOrder: (index + 1) * 10,
    }));
}

/** Provisional DTO so the phone preview updates BEFORE save (docs/07 AC-2). */
export function provisionalProduct(
  base: ProductDto | null,
  tempId: string,
  values: DraftFormValues,
  media: MediaDto | null,
): ProductDto {
  return {
    id: base?.id ?? tempId,
    name: values.name || "…",
    description: values.description ?? null,
    price: values.price ?? 0,
    discountedPrice: values.discountedPrice ?? null,
    discountActive: Boolean(values.discountActive),
    isAvailable: values.isAvailable ?? true,
    badges: values.badges ?? [],
    sortOrder: base?.sortOrder ?? 0,
    categoryId: values.categoryId || "",
    variants: draftVariants(tempId, values),
    media,
  };
}
