import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "cms_custom_pages" } });
  const pages = setting ? JSON.parse(setting.value) : [];

  return success({ pages });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const setting = await prisma.setting.findUnique({ where: { key: "cms_custom_pages" } });
  const pages = setting ? JSON.parse(setting.value) : [];

  const newPage = {
    id: crypto.randomUUID(),
    title: body.title,
    slug: body.slug || body.title?.toLowerCase().replace(/\s+/g, "-"),
    metaTitle: body.metaTitle || "",
    metaDescription: body.metaDescription || "",
    content: body.content || "",
    lastUpdated: new Date().toISOString(),
    status: body.status || "Draft",
  };

  pages.push(newPage);
  await prisma.setting.upsert({
    where: { key: "cms_custom_pages" },
    update: { value: JSON.stringify(pages) },
    create: { key: "cms_custom_pages", value: JSON.stringify(pages), group: "cms" },
  });

  return success({ page: newPage }, 201);
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function PATCH(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { id, ...updates } = body;

  const setting = await prisma.setting.findUnique({ where: { key: "cms_custom_pages" } });
  const pages = setting ? JSON.parse(setting.value) : [];
  const index = pages.findIndex((p: Record<string, unknown>) => p.id === id);
  if (index === -1) return success({ error: "Page not found" }, 404);

  pages[index] = { ...pages[index], ...updates, lastUpdated: new Date().toISOString() };
  await prisma.setting.upsert({
    where: { key: "cms_custom_pages" },
    update: { value: JSON.stringify(pages) },
    create: { key: "cms_custom_pages", value: JSON.stringify(pages), group: "cms" },
  });

  return success({ page: pages[index] });
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
