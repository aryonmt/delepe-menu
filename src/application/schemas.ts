// src/application/schemas.ts
import { z } from "zod";
import { BADGE_KINDS, THEME_NAMES, UNAVAILABLE_MODES } from "@/domain/entities";
import { PRICE_MAX_TOMAN, PRICE_MIN_TOMAN, TICKER_MAX_ITEMS } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";

const idSchema = z.string().min(1);

export const createCategorySchema = z.object({
  name: z.string().min(1).max(60),
  parentId: z.string().min(1).nullable().optional(),
});
export const updateCategorySchema = createCategorySchema.extend({ id: idSchema });
export const deleteCategorySchema = z.object({ id: idSchema });
export const reorderCategoriesSchema = z.object({
  orderedIds: z.array(idSchema).min(1),
  parentId: z.string().min(1).nullable(),
});

const variantSchema = z.object({
  name: z.string().min(1).max(40),
  price: z.number().int().min(PRICE_MIN_TOMAN).max(PRICE_MAX_TOMAN),
});

/** Shared product body — spread into create/update objects. */
const productFields = {
  name: z.string().min(1).max(120),
  description: z.string().max(500).nullable().optional(),
  price: z.number().int().min(PRICE_MIN_TOMAN).max(PRICE_MAX_TOMAN).optional(),
  discountedPrice: z.number().int().min(PRICE_MIN_TOMAN).max(PRICE_MAX_TOMAN).nullable().optional(),
  discountActive: z.boolean().optional().default(false),
  isAvailable: z.boolean().optional().default(true),
  badges: z.array(z.enum(BADGE_KINDS)).optional().default([]),
  categoryId: idSchema,
  mediaId: z.string().min(1).nullable().optional(),
  variants: z.array(variantSchema).optional().default([]),
};

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

function requirePriceWhenNoVariants(
  value: { variants: unknown[]; price?: number },
  ctx: z.RefinementCtx,
): void {
  if (value.variants.length === 0 && value.price === undefined) {
    ctx.addIssue({
      code: "custom",
      message: "price is required when the product has no variants",
      path: ["price"],
    });
  }
}

export const createProductSchema = z
  .object(productFields)
  .superRefine(requirePriceWhenNoVariants)
  .superRefine(uniqueVariantNames);
export const updateProductSchema = z
  .object({ id: idSchema, ...productFields })
  .superRefine(requirePriceWhenNoVariants)
  .superRefine(uniqueVariantNames);
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
  current: z.string().min(1).max(128),
  next: z.string().min(8).max(128),
  confirm: z.string().min(1).max(128),
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