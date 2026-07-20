import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized, notFound } from "@/lib/api-auth";
import { updateStock } from "@/lib/stock-helper";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });
  const { id } = await params;
  const invoice = await prisma.salesInvoice.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { customer: true },
  });
  if (!invoice) return notFound("Invoice not found");
  return Response.json(invoice);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });
  const { id } = await params;
  const existing = await prisma.salesInvoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Invoice not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  const fields = [
    "customerName", "customerId", "invoiceDate", "dueDate",
    "warehouseId", "warehouseName", "paymentTerms", "notes",
    "items", "subtotal", "discount", "tax", "total", "balance",
    "status", "signature", "generatedAt", "pdfUrl",
  ];
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f];
  }

  const invoice = await prisma.salesInvoice.update({ where: { id }, data });

  if (body.status && body.status !== "Draft" && existing.status === "Draft") {
    const items = Array.isArray(body.items) ? body.items : (existing.items as any[] || []);
    await updateStock(items, "decrease");
  }

  return Response.json(invoice);
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });
  const { id } = await params;
  const existing = await prisma.salesInvoice.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Invoice not found");
  await prisma.salesInvoice.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
