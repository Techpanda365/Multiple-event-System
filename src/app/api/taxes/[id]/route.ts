import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.tax.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Tax not found");
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.rate !== undefined) data.rate = Number(body.rate);
  if (body.isActive !== undefined) data.isActive = body.isActive;
  const tax = await prisma.tax.update({ where: { id }, data });
  return Response.json(tax);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.tax.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Tax not found");
  await prisma.tax.delete({ where: { id } });
  return Response.json({ success: true });
}
