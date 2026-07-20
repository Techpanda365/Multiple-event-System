import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const customers = await prisma.customer.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });

  return Response.json(customers);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const customerName = body.name || body.companyName;
  if (!customerName) return badRequest("Customer name is required");

  let customerCode = body.customerCode;
  if (!customerCode) {
    const count = await prisma.customer.count({ where: { workspaceId: ctx.workspace.id } });
    customerCode = `CUST-${String(count + 1).padStart(4, "0")}`;
  }

  const customer = await prisma.customer.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: customerName,
      userId: body.userId || null,
      customerCode,
      contactPerson: body.contactPerson || null,
      email: body.email || null,
      phone: body.phone || null,
      taxNumber: body.taxNumber || null,
      paymentTerms: body.paymentTerms || null,
      billingName: body.billingName || customerName,
      billingAddress: body.billingAddress || null,
      billingAddress2: body.billingAddress2 || null,
      billingCity: body.billingCity || null,
      billingState: body.billingState || null,
      billingCountry: body.billingCountry || null,
      billingZip: body.billingZip || null,
      shippingName: body.shippingName || null,
      shippingAddress: body.shippingAddress || null,
      shippingAddress2: body.shippingAddress2 || null,
      shippingCity: body.shippingCity || null,
      shippingState: body.shippingState || null,
      shippingCountry: body.shippingCountry || null,
      shippingZip: body.shippingZip || null,
    },
  });

  return Response.json(customer, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
