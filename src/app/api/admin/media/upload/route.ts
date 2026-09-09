// src/app/api/admin/media/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { container } from "@/infrastructure/di/container";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { toActionFailure, assertSameOrigin } from "@/app/_lib/server-action";

export async function POST(req: NextRequest) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  try {
    await assertSameOrigin();
    await container.verifySession().execute({ token });
  } catch {
    return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED", fa: "نشست شما معتبر نیست" } }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const width = Number(formData.get("width"));
  const height = Number(formData.get("height"));

  if (!file || !width || !height) {
    return NextResponse.json({ ok: false, error: { code: "INVALID_UPLOAD", fa: "فایل تصویر نامعتبر است" } }, { status: 400 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());

  try {
    const result = await container.uploadMedia().execute({
      bytes,
      fileName: file.name,
      width,
      height,
    });
    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    const failure = toActionFailure(error);
    return NextResponse.json(failure, { status: 400 });
  }
}