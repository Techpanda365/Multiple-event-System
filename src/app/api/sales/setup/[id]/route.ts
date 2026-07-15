import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const item = await prisma.systemSetup.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!item) return notFound("Item not found");
  return Response.json(item);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.systemSetup.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Item not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.type !== undefined) data.type = body.type;
  if (body.attributes !== undefined) data.attributes = body.attributes;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.order !== undefined) data.order = body.order;

  const updated = await prisma.systemSetup.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.systemSetup.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Item not found");
  await prisma.systemSetup.delete({ where: { id } });
  return Response.json({ success: true });
}
