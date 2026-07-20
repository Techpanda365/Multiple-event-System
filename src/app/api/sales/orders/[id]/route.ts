import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const order = await prisma.salesOrder.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { opportunity: true },
  });
  if (!order) return notFound();
  return Response.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  for (const key of [
    "name", "customerName", "customerEmail", "customerId", "opportunityId",
    "quoteId", "quoteNumber", "accountId", "accountName",
    "assignedUserId", "assignedUserName", "warehouseId", "warehouseName",
    "billingAddress", "billingCity", "billingState", "billingCountry", "billingPostalCode",
    "shippingSameAsBilling", "shippingAddress", "shippingCity", "shippingState",
    "shippingCountry", "shippingPostalCode",
    "billingContactId", "billingContactName", "shippingContactId", "shippingContactName",
    "shippingProvider", "description", "notes", "status", "items",
    "subtotal", "tax", "discount", "total",
  ]) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (body.orderDate) data.orderDate = new Date(body.orderDate);
  if (body.dueDate) data.dueDate = new Date(body.dueDate);

  const result = await prisma.salesOrder.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data,
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.salesOrder.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
