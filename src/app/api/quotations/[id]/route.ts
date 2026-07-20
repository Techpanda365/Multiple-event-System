import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const q = await prisma.quotation.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!q) return notFound("Quotation not found");
  return Response.json(q);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.quotation.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Quotation not found");

  const data: Record<string, unknown> = {};
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.items !== undefined) {
    const items = body.items;
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.unitPrice) || 0), 0);
    data.items = items;
    data.subtotal = subtotal;
    data.total = subtotal - (Number(body.discount) || existing.discount) + (Number(body.tax) || existing.tax);
  }
  if (body.discount !== undefined) data.discount = Number(body.discount);
  if (body.tax !== undefined) data.tax = Number(body.tax);

  const updated = await prisma.quotation.update({ where: { id }, data });
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
  const { id } = await params;
  const existing = await prisma.quotation.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Quotation not found");
  await prisma.quotation.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
