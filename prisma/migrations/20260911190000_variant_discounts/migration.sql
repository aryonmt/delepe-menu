-- Per-variant discount (BR-14 rewrite: discounts allowed on variants).
ALTER TABLE "ProductVariant" ADD COLUMN "discountedPrice" INTEGER;
ALTER TABLE "ProductVariant" ADD COLUMN "discountActive" BOOLEAN NOT NULL DEFAULT false;
