import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.department.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Department not found");
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  const dept = await prisma.department.update({ where: { id }, data });
  return Response.json(dept);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.department.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Department not found");
  await prisma.department.delete({ where: { id } });
  return Response.json({ success: true });
}
