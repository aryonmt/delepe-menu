"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ActionResult } from "@/application/dtos";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { sessionCookieOptions } from "@/lib/session-cookie";
import {
  assertSameOrigin,
  clientIp,
  isNextRedirect,
  toActionFailure,
} from "../_lib/server-action";

export async function loginAction(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    const result = await container.login().execute({
      username: String(formData.get("username") ?? ""),
      password: String(formData.get("password") ?? ""),
      ip: await clientIp(),
    });
    const jar = await cookies();
    jar.set(SESSION_COOKIE_NAME, result.token, sessionCookieOptions());
  } catch (error) {
    if (isNextRedirect(error)) {
      throw error;
    }
    return toActionFailure(error);
  }
  redirect("/admin/products");
}
