import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;
  const body = await req.json();

  const existing = await prisma.assetMaintenance.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Maintenance record not found", 404);

  const data: Record<string, unknown> = {};
  if (body.assetId !== undefined) data.assetId = body.assetId || null;
  if (body.assetName !== undefined) data.assetName = body.assetName;
  if (body.type !== undefined) data.type = body.type;
  if (body.title !== undefined) data.title = body.title.trim();
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.scheduledDate !== undefined) data.scheduledDate = new Date(body.scheduledDate);
  if (body.completedDate !== undefined) data.completedDate = body.completedDate ? new Date(body.completedDate) : null;
  if (body.cost !== undefined) data.cost = body.cost ? parseFloat(body.cost) : null;
  if (body.technician !== undefined) data.technician = body.technician?.trim() || null;
  if (body.status !== undefined) data.status = body.status;
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.nextMaintenance !== undefined) data.nextMaintenance = body.nextMaintenance ? new Date(body.nextMaintenance) : null;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

  const updated = await prisma.assetMaintenance.update({ where: { id }, data });
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

  const existing = await prisma.assetMaintenance.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Maintenance record not found", 404);

  await prisma.assetMaintenance.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
