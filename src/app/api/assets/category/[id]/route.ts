import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;
  const body = await req.json();
  const existing = await prisma.assetCategory.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Category not found", 404);
  const name = body.name?.trim();
  if (!name) return badRequest("Name is required");
  const dup = await prisma.assetCategory.findFirst({ where: { workspaceId: ctx.workspace.id, name, id: { not: id } } });
  if (dup) return badRequest("Category already exists");
  const updated = await prisma.assetCategory.update({ where: { id }, data: { name } });
  return Response.json(updated);
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;
  const existing = await prisma.assetCategory.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Category not found", 404);
  await prisma.assetCategory.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
