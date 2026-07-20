import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const asset = await prisma.asset.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!asset) return notFound("Asset not found");
  return Response.json(asset);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.asset.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Asset not found");
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.category !== undefined) data.category = body.category;
  if (body.status !== undefined) data.status = body.status;
  if (body.location !== undefined) data.location = body.location;
  if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo;
  if (body.currentValue !== undefined) data.currentValue = Number(body.currentValue);
  if (body.notes !== undefined) data.notes = body.notes;
  const asset = await prisma.asset.update({ where: { id }, data });
  return Response.json(asset);
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.asset.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Asset not found");
  await prisma.asset.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
