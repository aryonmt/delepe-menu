-- CreateEnum
CREATE TYPE "public"."BadgeKind" AS ENUM ('POPULAR', 'NEW', 'SPICY', 'VEGETARIAN');

-- CreateEnum
CREATE TYPE "public"."ThemeName" AS ENUM ('WARM_HONEY', 'MIDNIGHT_GOLD', 'IVORY_MINIMAL', 'DEEP_EMERALD');

-- CreateEnum
CREATE TYPE "public"."UnavailableMode" AS ENUM ('HIDE', 'MUTED');

-- CreateTable
CREATE TABLE "public"."Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "sortOrder" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "discountedPrice" INTEGER,
    "discountActive" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL,
    "badges" "public"."BadgeKind"[],
    "categoryId" TEXT NOT NULL,
    "mediaId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Media" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "dominantColor" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "restaurantName" TEXT NOT NULL,
    "theme" "public"."ThemeName" NOT NULL DEFAULT 'WARM_HONEY',
    "unavailableMode" "public"."UnavailableMode" NOT NULL DEFAULT 'MUTED',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminUser" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Category_parentId_sortOrder_idx" ON "public"."Category"("parentId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_parentId_name_key" ON "public"."Category"("parentId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Product_mediaId_key" ON "public"."Product"("mediaId");

-- CreateIndex
CREATE INDEX "Product_categoryId_sortOrder_idx" ON "public"."Product"("categoryId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Product_categoryId_name_key" ON "public"."Product"("categoryId", "name");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_sortOrder_idx" ON "public"."ProductVariant"("productId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_productId_name_key" ON "public"."ProductVariant"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Media_path_key" ON "public"."Media"("path");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_username_key" ON "public"."AdminUser"("username");

-- AddForeignKey
ALTER TABLE "public"."Category" ADD CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Product" ADD CONSTRAINT "Product_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "public"."Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "public"."Settings"
  ADD COLUMN "tickerProductIds" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];