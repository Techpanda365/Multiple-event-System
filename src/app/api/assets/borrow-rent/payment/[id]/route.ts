import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;
  const body = await req.json();

  const existing = await prisma.assetBorrowRentPayment.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Record not found", 404);

  const data: Record<string, unknown> = {};
  if (body.assetName !== undefined) data.assetName = body.assetName;
  if (body.customerName !== undefined) data.customerName = body.customerName;
  if (body.paymentAmount !== undefined) data.paymentAmount = parseFloat(body.paymentAmount);
  if (body.paymentDate !== undefined) data.paymentDate = new Date(body.paymentDate);
  if (body.referenceNumber !== undefined) data.referenceNumber = body.referenceNumber?.trim() || null;
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

  const updated = await prisma.assetBorrowRentPayment.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;

  const existing = await prisma.assetBorrowRentPayment.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Record not found", 404);

  await prisma.assetBorrowRentPayment.delete({ where: { id } });
  return Response.json({ success: true });
}
