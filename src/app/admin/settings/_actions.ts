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

export async function updateSettingsAction(
  _prev: ActionResult<SettingsDto> | null,
  formData: FormData,
): Promise<ActionResult<SettingsDto>> {
  try {
    await assertSameOrigin();
    const jar = await cookies();
    await container.verifySession().execute({
      token: jar.get(SESSION_COOKIE_NAME)?.value,
    });
    const settings = await container.updateSettings().execute({
      restaurantName: String(formData.get("restaurantName") ?? ""),
      theme: String(formData.get("theme") ?? ""),
      unavailableMode: String(formData.get("unavailableMode") ?? ""),
    });
    revalidatePublicMenu();
    revalidatePath("/", "layout");
    revalidatePath("/");
    return { ok: true, data: settings };
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    return toActionFailure(error);
  }
}
