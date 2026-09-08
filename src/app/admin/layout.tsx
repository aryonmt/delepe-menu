// src/app/admin/layout.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { AdminShell } from "@/components/admin/admin-shell";
import { Toaster } from "@/components/ui/sonner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  try {
    await container.verifySession().execute({ token });
  } catch {
    redirect("/login");
  }
  const menu = await container.getAdminMenu().execute();
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminShell initialData={menu} />
      <main className="pb-20 md:pb-0 md:ps-64">
        {children}
      </main>
      <Toaster richColors position="top-center" />
    </div>
  );
}