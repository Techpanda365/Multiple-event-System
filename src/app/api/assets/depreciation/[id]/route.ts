import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;
  const body = await req.json();

  const existing = await prisma.assetDepreciation.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Depreciation record not found", 404);

  const data: Record<string, unknown> = {};
  if (body.assetId !== undefined) data.assetId = body.assetId || null;
  if (body.assetName !== undefined) data.assetName = body.assetName;
  if (body.method !== undefined) data.method = body.method;
  if (body.usefulLife !== undefined) data.usefulLife = parseInt(body.usefulLife, 10);
  if (body.salvageValue !== undefined) data.salvageValue = parseFloat(body.salvageValue) || 0;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.accumulated !== undefined) data.accumulated = parseFloat(body.accumulated) || 0;
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

  const updated = await prisma.assetDepreciation.update({ where: { id }, data });
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

  const existing = await prisma.assetDepreciation.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Depreciation record not found", 404);

  await prisma.assetDepreciation.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
