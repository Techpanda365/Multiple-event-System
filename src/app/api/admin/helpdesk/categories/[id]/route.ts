import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, notFound, success } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.helpdeskCategory.findUnique({ where: { id } });
  if (!existing) return notFound("Category not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.color !== undefined) data.color = body.color;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const category = await prisma.helpdeskCategory.update({ where: { id }, data });

  return success({ category });
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.helpdeskCategory.findUnique({ where: { id } });
  if (!existing) return notFound("Category not found");

  await prisma.helpdeskCategory.delete({ where: { id } });

  return success({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
