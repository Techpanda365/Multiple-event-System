import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const purchaseReturn = await prisma.purchaseReturn.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!purchaseReturn) return notFound("Purchase return not found");
  return Response.json(purchaseReturn);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.purchaseReturn.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Purchase return not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.vendorName !== undefined) data.vendorName = body.vendorName;
  if (body.vendorId !== undefined) data.vendorId = body.vendorId;
  if (body.warehouseId !== undefined) data.warehouseId = body.warehouseId;
  if (body.warehouseName !== undefined) data.warehouseName = body.warehouseName;
  if (body.invoiceId !== undefined) data.invoiceId = body.invoiceId;
  if (body.returnDate !== undefined) data.returnDate = new Date(body.returnDate);
  if (body.reason !== undefined) data.reason = body.reason;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.items !== undefined) data.items = body.items;
  if (body.totalAmount !== undefined) data.totalAmount = body.totalAmount;
  if (body.status !== undefined) data.status = body.status;

  const purchaseReturn = await prisma.purchaseReturn.update({ where: { id }, data });
  return Response.json(purchaseReturn);
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
  const existing = await prisma.purchaseReturn.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Purchase return not found");
  await prisma.purchaseReturn.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
