// src/app/admin/_actions.ts
"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult, AdminMenuDto } from "@/application/dtos";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { clearSessionCookie } from "@/lib/session-cookie";
import {
  assertSameOrigin,
  isNextRedirect,
  toActionFailure,
} from "../_lib/server-action";

export async function logoutAction(): Promise<void> {
  await assertSameOrigin();
  await container.logout().execute();
  const jar = await cookies();
  clearSessionCookie(jar);
  redirect("/login");
}

export async function changePasswordAction(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    const jar = await cookies();
    const { adminId } = await container.verifySession().execute({
      token: jar.get(SESSION_COOKIE_NAME)?.value,
    });
    await container.changePassword().execute({
      adminId,
      current: String(formData.get("current") ?? ""),
      next: String(formData.get("next") ?? ""),
      confirm: String(formData.get("confirm") ?? ""),
    });
    return { ok: true, data: null };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

/** Fresh AdminMenuDto for «بازگشت به منوی ذخیره‌شده» (docs/07 rule 6). */
export async function refreshAdminMenuAction(): Promise<ActionResult<AdminMenuDto>> {
  try {
    await assertSameOrigin();
    const jar = await cookies();
    await container.verifySession().execute({
      token: jar.get(SESSION_COOKIE_NAME)?.value,
    });
    const menu = await container.getAdminMenu().execute();
    return { ok: true, data: menu };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}