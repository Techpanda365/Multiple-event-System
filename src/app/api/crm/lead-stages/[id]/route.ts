import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.crmLeadStage.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name?.trim() || existing.name;
  if (body.color !== undefined) data.color = body.color?.trim() || null;
  if (body.order !== undefined) data.order = Number(body.order);
  const updated = await prisma.crmLeadStage.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.crmLeadStage.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");
  await prisma.crmLeadStage.delete({ where: { id } });
  return Response.json({ success: true });
}
