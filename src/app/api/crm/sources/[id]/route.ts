import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.crmSource.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name?.trim() || existing.name;
  const updated = await prisma.crmSource.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.crmSource.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");
  await prisma.crmSource.delete({ where: { id } });
  return Response.json({ success: true });
}
