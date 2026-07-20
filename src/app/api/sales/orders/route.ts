import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const orders = await prisma.salesOrder.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status ? { status } : {}),
      ...(search ? { customerName: { contains: search } } : {}),
    },
    include: { opportunity: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(orders);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.customerName) return badRequest("Customer name is required");

  interface Item { qty?: number; unitPrice?: number; discountPct?: number; tax?: string }
  const items: Item[] = Array.isArray(body.items) ? body.items : [];
  const subtotal = items.reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0);
  const tax = items.reduce((s, i) => {
    const lineTotal = (i.qty || 0) * (i.unitPrice || 0);
    const discAmt = lineTotal * ((i.discountPct || 0) / 100);
    const rate = i.tax === "SGST 6%" || i.tax === "CGST 6%" ? 6 : i.tax === "IGST 12%" ? 12 : 0;
    return s + (lineTotal - discAmt) * (rate / 100);
  }, 0);
  const discount = items.reduce((s, i) => {
    const lineTotal = (i.qty || 0) * (i.unitPrice || 0);
    return s + lineTotal * ((i.discountPct || 0) / 100);
  }, 0);

  const count = await prisma.salesOrder.count({ where: { workspaceId: ctx.workspace.id } });
  const orderNumber = `SO-${String(count + 1).padStart(5, "0")}`;

  const order = await prisma.salesOrder.create({
    data: {
      workspaceId: ctx.workspace.id,
      orderNumber,
      name: body.name || null,
      customerId: body.customerId || null,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      opportunityId: body.opportunityId || null,
      quoteId: body.quoteId || null,
      quoteNumber: body.quoteNumber || null,
      accountId: body.accountId || null,
      accountName: body.accountName || null,
      assignedUserId: body.assignedUserId || null,
      assignedUserName: body.assignedUserName || null,
      warehouseId: body.warehouseId || null,
      warehouseName: body.warehouseName || null,
      billingAddress: body.billingAddress || null,
      billingCity: body.billingCity || null,
      billingState: body.billingState || null,
      billingCountry: body.billingCountry || null,
      billingPostalCode: body.billingPostalCode || null,
      shippingSameAsBilling: body.shippingSameAsBilling || false,
      shippingAddress: body.shippingAddress || null,
      shippingCity: body.shippingCity || null,
      shippingState: body.shippingState || null,
      shippingCountry: body.shippingCountry || null,
      shippingPostalCode: body.shippingPostalCode || null,
      billingContactId: body.billingContactId || null,
      billingContactName: body.billingContactName || null,
      shippingContactId: body.shippingContactId || null,
      shippingContactName: body.shippingContactName || null,
      shippingProvider: body.shippingProvider || null,
      description: body.description || null,
      notes: body.notes || null,
      items,
      subtotal,
      tax,
      discount,
      total: subtotal - discount + tax,
      status: body.status || "Draft",
      orderDate: body.orderDate ? new Date(body.orderDate) : new Date(),
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    },
  });
  return Response.json(order, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
