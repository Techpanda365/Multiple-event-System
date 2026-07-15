import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const transfer = await prisma.stockTransfer.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!transfer) return notFound("Transfer not found");
  return Response.json(transfer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.stockTransfer.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Transfer not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.fromWarehouseName !== undefined) data.fromWarehouseName = body.fromWarehouseName;
  if (body.toWarehouseName !== undefined) data.toWarehouseName = body.toWarehouseName;
  if (body.productName !== undefined) data.productName = body.productName;
  if (body.quantity !== undefined) data.quantity = Number(body.quantity);
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;

  const transfer = await prisma.stockTransfer.update({ where: { id }, data });
  return Response.json(transfer);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.stockTransfer.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Transfer not found");
  await prisma.stockTransfer.delete({ where: { id } });
  return Response.json({ success: true });
}
