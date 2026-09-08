import type { z } from "zod";
import type { MediaDto, ProductDto } from "@/application/dtos";
import { createProductSchema } from "@/application/schemas";
import { toAsciiDigits } from "@/lib/format/digits";

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
  variants?: Array<{ name?: string; price?: number } | undefined>;
};

/** Provisional DTO so the phone preview updates BEFORE save (docs/07 AC-2). */
export function provisionalProduct(
  base: ProductDto | null,
  tempId: string,
  values: DraftFormValues,
  media: MediaDto | null,
): ProductDto {
  const variants = (values.variants ?? [])
    .filter((v): v is { name: string; price: number } =>
      Boolean(v?.name) && (v?.price ?? 0) > 0,
    )
    .map((v, index) => ({
      id: `${tempId}-v${index}`,
      name: v.name,
      price: v.price,
      sortOrder: (index + 1) * 10,
    }));
  const price =
    variants.length > 0
      ? Math.min(...variants.map((v) => v.price))
      : (values.price ?? 0);
  return {
    id: base?.id ?? tempId,
    name: values.name || "…",
    description: values.description ?? null,
    price,
    discountedPrice: variants.length > 0 ? null : (values.discountedPrice ?? null),
    discountActive: variants.length > 0 ? false : Boolean(values.discountActive),
    isAvailable: values.isAvailable ?? true,
    badges: values.badges ?? [],
    sortOrder: base?.sortOrder ?? 0,
    categoryId: values.categoryId || "",
    variants,
    media,
  };
}
