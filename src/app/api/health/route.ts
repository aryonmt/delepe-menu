import { NextResponse } from "next/server";
import { checkDatabaseHealth } from "@/infrastructure/prisma/health";

export async function GET() {
  const db = await checkDatabaseHealth();
  if (!db) {
    return NextResponse.json({ ok: false, db: false }, { status: 503 });
  }
  return NextResponse.json({ ok: true, db: true });
}
