import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";
import { randomUUID } from "crypto";
import { updateStock } from "@/lib/stock-helper";


export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const invoices = await prisma.salesInvoice.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(invoices);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.customerName) return badRequest("Customer name is required");

  const items = body.items || [];
  const subtotal = items.reduce((s: number, i: any) => s + (i.quantity || 0) * (i.unitPrice || 0), 0);
  const discount = body.discount || 0;
  const tax = body.tax || 0;
  const total = subtotal - discount + tax;

  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");

  // Count only today's invoices taaki har din 001 se shuru ho
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd   = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  const todayCount = await prisma.salesInvoice.count({
    where: {
      workspaceId: ctx.workspace.id,
      createdAt: { gte: todayStart, lte: todayEnd },
    },
  });

  const random = Math.random().toString(16).substring(2, 15);
  const invoiceNumber = `INV-${dateStr}-${random}`;
  console.log(invoiceNumber,"invoiceNumber","deeepepep")

  // const invoiceNumber = `SI-${dateStr}-${String(todayCount + 1).padStart(3, "0")}`;

  const invoice = await prisma.salesInvoice.create({
    data: {
      workspaceId: ctx.workspace.id,
      invoiceNumber,
      customerId: body.customerId || null,
      customerName: body.customerName,
      invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      warehouseId: body.warehouseId || null,
      warehouseName: body.warehouseName || null,
      paymentTerms: body.paymentTerms || null,
      notes: body.notes || null,
      items,
      subtotal,
      discount,
      tax,
      total,
      balance: total,
      status: body.status || "Draft",
    },
  });

  const finalStatus = body.status || "Draft";
  if (finalStatus !== "Draft") {
    await updateStock(items, "decrease");
  }

  return Response.json(invoice, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
