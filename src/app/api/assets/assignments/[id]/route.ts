import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.assetAssignment.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.assetName !== undefined) data.assetName = body.assetName?.trim() || existing.assetName;
  if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo?.trim() || existing.assignedTo;
  if (body.assignedDate !== undefined) data.assignedDate = new Date(body.assignedDate);
  if (body.expectedReturn !== undefined) data.expectedReturn = body.expectedReturn ? new Date(body.expectedReturn) : null;
  if (body.actualReturn !== undefined) data.actualReturn = body.actualReturn ? new Date(body.actualReturn) : null;
  if (body.status !== undefined) data.status = body.status;
  if (body.condition !== undefined) data.condition = body.condition;
  if (body.returnCondition !== undefined) data.returnCondition = body.returnCondition || null;
  if (body.returnNotes !== undefined) data.returnNotes = body.returnNotes?.trim() || null;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

  const updated = await prisma.assetAssignment.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.assetAssignment.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");
  await prisma.assetAssignment.delete({ where: { id } });
  return Response.json({ success: true });
}
