// src/app/admin/products/page.tsx
import { strings } from "@/lib/fa/strings";
import { ProductList } from "@/components/admin/product-list";
import { AdminSessionPanel } from "./session-panel";

export default function AdminProductsPage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 md:px-8">
      <h1 className="font-display text-3xl text-foreground mb-6">
        {strings.admin.productsHeading}
      </h1>
      <ProductList />
      {/* M2 auth.spec contract: change-password form lives on this page until
          the M6 dialog (T-063) replaces it. */}
      <AdminSessionPanel />
    </div>
  );
}