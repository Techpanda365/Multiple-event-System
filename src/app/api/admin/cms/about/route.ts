import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

const KEY = "cms_about";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();
  const setting = await prisma.setting.findUnique({ where: { key: KEY } });
  return success({ content: setting?.value ? JSON.parse(setting.value) : { title: "", content: "" } });
}

export async function PUT(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: JSON.stringify(body) },
    update: { value: JSON.stringify(body) },
  });
  return success({ success: true });
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
