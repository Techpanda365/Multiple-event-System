import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const invoice = await prisma.invoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!invoice) return notFound("Invoice not found");
  return Response.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.invoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Invoice not found");

  const data: Record<string, unknown> = {};
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.customerEmail !== undefined) data.customerEmail = body.customerEmail;
  if (body.status !== undefined) data.status = body.status;
  if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.items !== undefined) {
    const items = body.items;
    const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.unitPrice) || 0), 0);
    data.items = items;
    data.subtotal = subtotal;
    data.total = subtotal + (Number(body.tax) !== undefined ? Number(body.tax) : existing.tax);
  }
  if (body.tax !== undefined) data.tax = Number(body.tax);

  const invoice = await prisma.invoice.update({ where: { id }, data });
  return Response.json(invoice);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.invoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Invoice not found");

  await prisma.invoice.delete({ where: { id } });
  return Response.json({ success: true });
}
