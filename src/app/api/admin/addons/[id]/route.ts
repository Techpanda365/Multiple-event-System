import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, notFound, success } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.addon.findUnique({ where: { id } });
  if (!existing) return notFound("Addon not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) {
    const slugExists = await prisma.addon.findFirst({ where: { slug: body.slug, NOT: { id } } });
    if (slugExists) return badRequest("Slug already in use");
    data.slug = body.slug;
  }
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.isPremium !== undefined) data.isPremium = body.isPremium;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.version !== undefined) data.version = body.version;

  const addon = await prisma.addon.update({ where: { id }, data });

  return success({ addon });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.addon.findUnique({ where: { id } });
  if (!existing) return notFound("Addon not found");

  await prisma.addon.delete({ where: { id } });

  return success({ success: true });
}
