import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "side_menus" } });
  const menus = setting ? JSON.parse(setting.value) : [];

  return success({ menus });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const setting = await prisma.setting.findUnique({ where: { key: "side_menus" } });
  const menus = setting ? JSON.parse(setting.value) : [];

  const newMenu = {
    id: crypto.randomUUID(),
    menuType: body.menuType || "sidebar",
    name: body.name,
    identifier: body.identifier || body.name?.toLowerCase().replace(/\s+/g, "_"),
    parent: body.parent || "",
    link: body.link || "#",
    linkType: body.linkType || "internal",
    position: body.position ?? 0,
    icon: body.icon || "Menu",
    global: body.global ?? false,
    status: body.status ?? true,
  };

  menus.push(newMenu);
  await prisma.setting.upsert({
    where: { key: "side_menus" },
    update: { value: JSON.stringify(menus) },
    create: { key: "side_menus", value: JSON.stringify(menus), group: "menu" },
  });

  return success({ menu: newMenu }, 201);
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

  const setting = await prisma.setting.findUnique({ where: { key: "side_menus" } });
  const menus = setting ? JSON.parse(setting.value) : [];
  const index = menus.findIndex((m: Record<string, unknown>) => m.id === id);
  if (index === -1) return success({ error: "Menu not found" }, 404);

  menus[index] = { ...menus[index], ...updates };
  await prisma.setting.upsert({
    where: { key: "side_menus" },
    update: { value: JSON.stringify(menus) },
    create: { key: "side_menus", value: JSON.stringify(menus), group: "menu" },
  });

  return success({ menu: menus[index] });
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
