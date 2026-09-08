// src/app/admin/products/page.tsx
import { strings } from "@/lib/fa/strings";
import { ProductList } from "@/components/admin/product-list";

export default function AdminProductsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-display text-3xl text-foreground mb-6">
        {strings.admin.productsHeading}
      </h1>
      <ProductList />
    </div>
  );
}