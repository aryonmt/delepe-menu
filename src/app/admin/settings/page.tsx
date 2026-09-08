// src/app/admin/settings/page.tsx
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TickerManager } from "@/components/admin/ticker-manager";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { strings } from "@/lib/fa/strings";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  try {
    await container.verifySession().execute({ token });
  } catch {
    redirect("/login");
  }
  return (
    <div className="mx-auto w-full max-w-lg px-6 py-12">
      <h1 className="font-display text-hero text-foreground">{strings.admin.settingsHeading}</h1>
      <SettingsForm />
      <div className="mt-10">
        <TickerManager />
      </div>
    </div>
  );
}
