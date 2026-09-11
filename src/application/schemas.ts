// src/application/schemas.ts
import { z } from "zod";
import { BADGE_KINDS, THEME_NAMES, UNAVAILABLE_MODES } from "@/domain/entities";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PRICE_MAX_TOMAN,
  PRICE_MIN_TOMAN,
  TICKER_MAX_ITEMS,
} from "@/lib/constants";
import { strings } from "@/lib/fa/strings";

const fa = strings.errors.fields;
const idSchema = z.string().min(1, fa.required);

export const createCategorySchema = z.object({
  name: z.string().min(1, fa.required).max(60),
  parentId: z.string().min(1).nullable().optional(),
});
export const updateCategorySchema = createCategorySchema.extend({ id: idSchema });
export const deleteCategorySchema = z.object({ id: idSchema });
export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(idSchema).min(1),
  parentId: z.string().min(1).nullable(),
});

const toman = z
  .number({ error: fa.priceInvalid })
  .int({ error: fa.priceRange })
  .min(PRICE_MIN_TOMAN, fa.priceRange)
  .max(PRICE_MAX_TOMAN, fa.priceRange);

const variantSchema = z.object({
  name: z.string().trim().min(1, fa.required).max(40, fa.variantNameMax),
  price: toman,
  discountedPrice: toman.nullable().optional(),
  discountActive: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
});

/** Shared product body — spread into create/update objects. */
const productFields = {
  name: z.string().min(1, fa.required).max(120, fa.nameMax),
  description: z.string().max(500, fa.descriptionMax).nullable().optional(),
  price: toman,
  discountedPrice: toman.nullable().optional(),
  discountActive: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
  badges: z.array(z.enum(BADGE_KINDS)).optional().default([]),
  categoryId: z.string().min(1, fa.categoryRequired),
  mediaId: z.string().min(1).nullable().optional(),
  variants: z.array(variantSchema).optional().default([]),
};

type DiscountUnit = {
  price: number;
  discountedPrice?: number | null;
  discountActive?: boolean;
};

function refineDiscount(
  unit: DiscountUnit,
  ctx: z.RefinementCtx,
  path: Array<string | number>,
): void {
  const discounted = unit.discountedPrice ?? null;
  if (unit.discountActive && discounted === null) {
    ctx.addIssue({
      code: "custom",
      message: strings.errors.domain.INVALID_DISCOUNT,
      path: [...path, "discountedPrice"],
    });
    return;
  }
  if (discounted !== null && discounted >= unit.price) {
    ctx.addIssue({
      code: "custom",
      message: strings.errors.domain.INVALID_DISCOUNT,
      path: [...path, "discountedPrice"],
    });
  }
}

function uniqueVariantNames(
  value: { variants: { name: string }[] },
  ctx: z.RefinementCtx,
): void {
  const seen = new Set<string>();
  for (const [index, variant] of value.variants.entries()) {
    const name = variant.name.trim();
    if (seen.has(name)) {
      ctx.addIssue({
        code: "custom",
        message: strings.errors.domain.DUPLICATE_NAME,
        path: ["variants", index, "name"],
      });
    }
    seen.add(name);
  }
}

function productDiscounts(
  value: DiscountUnit & { variants: DiscountUnit[] },
  ctx: z.RefinementCtx,
): void {
  refineDiscount(value, ctx, []);
  for (const [index, variant] of value.variants.entries()) {
    refineDiscount(variant, ctx, ["variants", index]);
  }
}

export const createProductSchema = z
  .object(productFields)
  .superRefine(uniqueVariantNames)
  .superRefine(productDiscounts);
export const updateProductSchema = z
  .object({ id: idSchema, ...productFields })
  .superRefine(uniqueVariantNames)
  .superRefine(productDiscounts);
export const getProductSchema = z.object({ id: idSchema });
export const deleteProductSchema = z.object({ id: idSchema });
export const reorderProductsSchema = z.object({
  orderedIds: z.array(idSchema).min(1),
  categoryId: idSchema,
});

export const updateSettingsSchema = z.object({
  restaurantName: z.string().min(1).max(80),
  theme: z.enum(THEME_NAMES),
  unavailableMode: z.enum(UNAVAILABLE_MODES),
  /** Omitted = preserve the existing curation (plain settings save). */
  tickerProductIds: z.array(idSchema).max(TICKER_MAX_ITEMS).optional(),
});

export const uploadMediaSchema = z.object({
  bytes: z.instanceof(Uint8Array).refine((bytes) => bytes.byteLength > 0),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  fileName: z.string().min(1).max(200),
});
export const deleteMediaSchema = z.object({ mediaId: idSchema });
export const getMediaSchema = z.object({ id: z.string().uuid() });
export const loginSchema = z.object({
  username: z.string().min(1).max(40),
  password: z.string().min(1).max(128),
  ip: z.string().min(1),
});
export const changePasswordSchema = z.object({
  adminId: z.string().min(1),
  current: z.string().min(1).max(PASSWORD_MAX_LENGTH),
  next: z.string().min(PASSWORD_MIN_LENGTH).max(PASSWORD_MAX_LENGTH),
  confirm: z.string().min(1).max(PASSWORD_MAX_LENGTH),
});
export const verifySessionSchema = z.object({ token: z.string().min(1).optional() });

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ReorderCategoriesInput = z.infer<typeof reorderCategoriesSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ReorderProductsInput = z.infer<typeof reorderProductsSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;