// src/app/admin/settings/_actions.ts
"use server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { ActionResult, SettingsDto } from "@/application/dtos";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { revalidatePublicMenu } from "@/lib/public-menu-cache";
import {
  assertSameOrigin,
  isNextRedirect,
  toActionFailure,
} from "../../_lib/server-action";

async function requireAdmin(): Promise<SettingsDto> {
  const jar = await cookies();
  await container.verifySession().execute({
    token: jar.get(SESSION_COOKIE_NAME)?.value,
  });
  return container.getSettings().execute();
}

function revalidateAll(): void {
  revalidatePublicMenu();
  revalidatePath("/", "layout");
  revalidatePath("/");
}

export async function updateSettingsAction(
  _prev: ActionResult<SettingsDto> | null,
  formData: FormData,
): Promise<ActionResult<SettingsDto>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    const settings = await container.updateSettings().execute({
      restaurantName: String(formData.get("restaurantName") ?? ""),
      theme: String(formData.get("theme") ?? ""),
      unavailableMode: String(formData.get("unavailableMode") ?? ""),
    });
    revalidateAll();
    return { ok: true, data: settings };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

/** Persists the curated hero-ticker order, preserving name/mode/theme. */
export async function updateTickerAction(
  ids: string[],
): Promise<ActionResult<SettingsDto>> {
  try {
    await assertSameOrigin();
    const current = await requireAdmin();
    const settings = await container.updateSettings().execute({
      restaurantName: current.restaurantName,
      theme: current.theme,
      unavailableMode: current.unavailableMode,
      tickerProductIds: ids,
    });
    revalidateAll();
    return { ok: true, data: settings };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}