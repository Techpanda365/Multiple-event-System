import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

const KEY = "cms_blogs";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();
  const setting = await prisma.setting.findUnique({ where: { key: KEY } });
  return success({ blogs: setting?.value ? JSON.parse(setting.value) : [] });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const setting = await prisma.setting.findUnique({ where: { key: KEY } });
  const blogs = setting?.value ? JSON.parse(setting.value) : [];
  blogs.push({ id: crypto.randomUUID(), ...body, createdAt: new Date().toISOString() });
  await prisma.setting.upsert({
    where: { key: KEY },
    create: { key: KEY, value: JSON.stringify(blogs) },
    update: { value: JSON.stringify(blogs) },
  });
  return success({ blog: blogs[blogs.length - 1] }, 201);
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
