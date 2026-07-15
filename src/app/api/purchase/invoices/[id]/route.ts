import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const invoice = await prisma.purchaseInvoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!invoice) return notFound("Invoice not found");
  return Response.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.purchaseInvoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Invoice not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.vendorName !== undefined) data.vendorName = body.vendorName;
  if (body.vendorId !== undefined) data.vendorId = body.vendorId;
  if (body.invoiceDate !== undefined) data.invoiceDate = new Date(body.invoiceDate);
  if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.warehouseId !== undefined) data.warehouseId = body.warehouseId;
  if (body.warehouseName !== undefined) data.warehouseName = body.warehouseName;
  if (body.paymentTerms !== undefined) data.paymentTerms = body.paymentTerms;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.items !== undefined) data.items = body.items;
  if (body.subtotal !== undefined) data.subtotal = body.subtotal;
  if (body.discount !== undefined) data.discount = body.discount;
  if (body.tax !== undefined) data.tax = body.tax;
  if (body.total !== undefined) data.total = body.total;
  if (body.balance !== undefined) data.balance = body.balance;
  if (body.status !== undefined) data.status = body.status;
  if (body.recurring !== undefined) data.recurring = body.recurring;
  if (body.recurringFreq !== undefined) data.recurringFreq = body.recurringFreq;
  if (body.customRecurringDays !== undefined) data.customRecurringDays = body.customRecurringDays ? Number(body.customRecurringDays) : null;

  const invoice = await prisma.purchaseInvoice.update({ where: { id }, data });
  return Response.json(invoice);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.purchaseInvoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Invoice not found");
  await prisma.purchaseInvoice.delete({ where: { id } });
  return Response.json({ success: true });
}
