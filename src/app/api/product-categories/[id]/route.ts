import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.productCategory.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Category not found");
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.color !== undefined) data.color = body.color;
  const cat = await prisma.productCategory.update({ where: { id }, data });
  return Response.json(cat);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.productCategory.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Category not found");
  await prisma.productCategory.delete({ where: { id } });
  return Response.json({ success: true });
}
