import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { AdminSessionPanel } from "./session-panel";

export default async function AdminProductsPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  try {
    await container.verifySession().execute({ token });
  } catch {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="font-display text-hero text-foreground">
        {strings.admin.productsHeading}
      </h1>
      <AdminSessionPanel />
    </main>
  );
}
