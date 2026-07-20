import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const quotes = await prisma.salesQuote.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status ? { status } : {}),
      ...(search ? { customerName: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(quotes);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.customerName) return badRequest("Customer name is required");

  const items = Array.isArray(body.items) ? body.items : [];
  interface Item { qty?: number; unitPrice?: number; discountPct?: number; tax?: string }
  const typedItems: Item[] = items;
  const subtotal = typedItems.reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0);
  const discount = typedItems.reduce((s, i) => {
    const lineTotal = (i.qty || 0) * (i.unitPrice || 0);
    return s + lineTotal * ((i.discountPct || 0) / 100);
  }, 0);
  const tax = typedItems.reduce((s, i) => {
    const lineTotal = (i.qty || 0) * (i.unitPrice || 0);
    const discAmt = lineTotal * ((i.discountPct || 0) / 100);
    const rate = i.tax === "SGST 6%" || i.tax === "CGST 6%" ? 6 : i.tax === "IGST 12%" ? 12 : 0;
    return s + (lineTotal - discAmt) * (rate / 100);
  }, 0);

  const count = await prisma.salesQuote.count({ where: { workspaceId: ctx.workspace.id } });
  const quoteNumber = `QTE-${String(count + 1).padStart(5, "0")}`;

  const quote = await prisma.salesQuote.create({
    data: {
      workspaceId: ctx.workspace.id,
      quoteNumber,
      name: body.name || null,
      customerId: body.customerId || null,
      customerName: body.customerName,
      customerEmail: body.customerEmail || null,
      opportunityId: body.opportunityId || null,
      opportunityName: body.opportunityName || null,
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
      quoteDate: body.quoteDate ? new Date(body.quoteDate) : new Date(),
      expiryDate: body.expiryDate ? new Date(body.expiryDate) : null,
    },
  });
  return Response.json(quote, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
