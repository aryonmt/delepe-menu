// src/app/admin/categories/_actions.ts
"use server";
import { cookies } from "next/headers";
import type { ActionResult, CategoryDto } from "@/application/dtos";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { revalidatePublicMenu } from "@/lib/public-menu-cache";
import {
  assertSameOrigin,
  isNextRedirect,
  toActionFailure,
} from "../../_lib/server-action";

async function requireAdmin(): Promise<void> {
  const jar = await cookies();
  await container.verifySession().execute({
    token: jar.get(SESSION_COOKIE_NAME)?.value,
  });
}

export async function createCategoryAction(
  _prev: ActionResult<CategoryDto> | null,
  formData: FormData,
): Promise<ActionResult<CategoryDto>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    const parentId = String(formData.get("parentId") ?? "");
    const category = await container.createCategory().execute({
      name: String(formData.get("name") ?? ""),
      parentId: parentId === "" ? null : parentId,
    });
    revalidatePublicMenu();
    return { ok: true, data: category };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

export async function updateCategoryAction(
  _prev: ActionResult<CategoryDto> | null,
  formData: FormData,
): Promise<ActionResult<CategoryDto>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    const parentId = String(formData.get("parentId") ?? "");
    const category = await container.updateCategory().execute({
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      parentId: parentId === "" ? null : parentId,
    });
    revalidatePublicMenu();
    return { ok: true, data: category };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

export async function deleteCategoryAction(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    await container
      .deleteCategory()
      .execute({ id: String(formData.get("id") ?? "") });
    revalidatePublicMenu();
    return { ok: true, data: null };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

export async function reorderCategoriesAction(
  parentId: string | null,
  orderedIds: string[],
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    await container.reorderCategories().execute({ parentId, orderedIds });
    revalidatePublicMenu();
    return { ok: true, data: null };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}