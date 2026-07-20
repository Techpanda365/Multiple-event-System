import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const ret = await prisma.salesReturn.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!ret) return notFound("Return not found");
  return Response.json(ret);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.salesReturn.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Return not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  const fields = ["customerName", "customerId", "warehouseId", "warehouseName", "invoiceId", "returnDate", "reason", "notes", "items", "totalAmount", "status"];
  for (const f of fields) {
    if (body[f] !== undefined) data[f] = body[f];
  }

  const updated = await prisma.salesReturn.update({ where: { id }, data });
  return Response.json(updated);
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
  const existing = await prisma.salesReturn.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Return not found");
  await prisma.salesReturn.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
