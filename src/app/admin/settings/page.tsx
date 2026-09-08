// src/app/admin/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { SettingsForm } from "./settings-form";
import { TickerManager } from "@/components/admin/ticker-manager";

export default async function AdminSettingsPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  try {
    await container.verifySession().execute({ token });
  } catch {
    redirect("/login");
  }
  const menu = await container.getAdminMenu().execute();
  return (
    <main className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="font-display text-hero text-foreground">{strings.admin.settingsHeading}</h1>
      <SettingsForm settings={menu.settings} />
      <div className="mt-10">
        <TickerManager settings={menu.settings} categories={menu.categories} />
      </div>
    </main>
  );
}