// src/app/admin/products/_actions.ts
"use server";
import { cookies } from "next/headers";
import type { ActionResult, ProductDto } from "@/application/dtos";
import { productDtoToUpdateInput } from "@/application/mappers/product-dto-to-update-input";
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

function parseProductForm(formData: FormData) {
  const variants = formData.getAll("variants").map((raw) => {
    const parsed = JSON.parse(String(raw)) as {
      name: string;
      price: number;
      discountedPrice?: number | null;
      discountActive?: boolean;
      isAvailable?: boolean;
    };
    return {
      name: parsed.name,
      price: parsed.price,
      discountedPrice: parsed.discountedPrice ?? null,
      discountActive: Boolean(parsed.discountActive),
      isAvailable: parsed.isAvailable ?? true,
    };
  });
  return {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || null,
    price: Number(formData.get("price")),
    discountedPrice: formData.get("discountedPrice")
      ? Number(formData.get("discountedPrice"))
      : null,
    discountActive: formData.get("discountActive") === "on",
    isAvailable: formData.get("isAvailable") === "on",
    badges: formData.getAll("badges").map(String),
    categoryId: String(formData.get("categoryId") ?? ""),
    mediaId: formData.get("mediaId") ? String(formData.get("mediaId")) : null,
    variants,
  };
}

export async function createProductAction(
  _prev: ActionResult<ProductDto> | null,
  formData: FormData,
): Promise<ActionResult<ProductDto>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    const product = await container
      .createProduct()
      .execute(parseProductForm(formData));
    revalidatePublicMenu();
    return { ok: true, data: product };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

export async function updateProductAction(
  _prev: ActionResult<ProductDto> | null,
  formData: FormData,
): Promise<ActionResult<ProductDto>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const product = await container
      .updateProduct()
      .execute({ id, ...parseProductForm(formData) });
    revalidatePublicMenu();
    return { ok: true, data: product };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

export async function deleteProductAction(
  _prev: ActionResult<null> | null,
  formData: FormData,
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    await container
      .deleteProduct()
      .execute({ id: String(formData.get("id") ?? "") });
    revalidatePublicMenu();
    return { ok: true, data: null };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

export async function updateProductAvailabilityAction(
  id: string,
  isAvailable: boolean,
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    const current = await container.getProduct().execute({ id });
    await container.updateProduct().execute(
      productDtoToUpdateInput(current, { isAvailable }),
    );
    revalidatePublicMenu();
    return { ok: true, data: null };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

export async function reorderProductsAction(
  categoryId: string,
  orderedIds: string[],
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    await container.reorderProducts().execute({ categoryId, orderedIds });
    revalidatePublicMenu();
    return { ok: true, data: null };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}

/** Orphan cleanup (docs/07 upload step 6): delete a media never attached. */
export async function deleteMediaAction(
  mediaId: string,
): Promise<ActionResult<null>> {
  try {
    await assertSameOrigin();
    await requireAdmin();
    await container.deleteMedia().execute({ mediaId });
    return { ok: true, data: null };
  } catch (error) {
    if (isNextRedirect(error)) throw error;
    return toActionFailure(error);
  }
}