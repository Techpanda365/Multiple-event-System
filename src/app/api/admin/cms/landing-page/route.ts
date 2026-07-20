import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "cms_landing_page" } });
  const landingPage = setting ? JSON.parse(setting.value) : null;

  return success({ landingPage });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  await prisma.setting.upsert({
    where: { key: "cms_landing_page" },
    update: { value: JSON.stringify(body) },
    create: { key: "cms_landing_page", value: JSON.stringify(body), group: "cms" },
  });

  return success({ message: "Landing page saved" });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
