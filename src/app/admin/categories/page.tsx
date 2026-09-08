// src/app/admin/categories/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CategoryTree } from "@/components/admin/category-tree";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";

export default async function AdminCategoriesPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  try {
    await container.verifySession().execute({ token });
  } catch {
    redirect("/login");
  }
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 md:px-8">
      <h1 className="font-display text-3xl text-foreground mb-6">
        {strings.admin.categoriesHeading}
      </h1>
      <CategoryTree />
    </div>
  );
}