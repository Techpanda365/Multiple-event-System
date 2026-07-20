import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";
import { updateStock } from "@/lib/stock-helper";

function generateInvoiceNumber(): string {
  const now = new Date();
  const prefix = `PI-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${prefix}-${rand}`;
}

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const invoices = await prisma.purchaseInvoice.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(invoices);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.vendorName) return badRequest("Vendor is required");

  const items = Array.isArray(body.items) ? body.items : [];

  const subtotal = body.subtotal ?? items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
    sum + (item.quantity || 0) * (item.unitPrice || 0), 0);
  const discount = body.discount ?? items.reduce((sum: number, item: { quantity: number; unitPrice: number; discountPct: number }) => {
    const sub = (item.quantity || 0) * (item.unitPrice || 0);
    return sum + sub * ((item.discountPct || 0) / 100);
  }, 0);
  const tax = body.tax ?? items.reduce((sum: number, item: { quantity: number; unitPrice: number; discountPct: number; tax: string }) => {
    const sub = (item.quantity || 0) * (item.unitPrice || 0);
    const discAmt = sub * ((item.discountPct || 0) / 100);
    const rate = item.tax === "SGST 6%" || item.tax === "CGST 6%" ? 6 : item.tax === "IGST 12%" ? 12 : 0;
    return sum + (sub - discAmt) * (rate / 100);
  }, 0);
  const afterDiscount = subtotal - discount;
  const total = body.total ?? (afterDiscount + tax);

  const invoice = await prisma.purchaseInvoice.create({
    data: {
      workspaceId: ctx.workspace.id,
      invoiceNumber: body.invoiceNumber || generateInvoiceNumber(),
      vendorId: body.vendorId || null,
      vendorName: body.vendorName,
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
      balance: body.balance ?? total,
      status: body.status || "Draft",
      recurring: body.recurring === true,
      recurringFreq: body.recurringFreq || null,
      customRecurringDays: body.customRecurringDays ? Number(body.customRecurringDays) : null,
    },
  });

  const finalStatus = body.status || "Draft";
  if (finalStatus !== "Draft") {
    await updateStock(items, "increase");
  }

  return Response.json(invoice, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
