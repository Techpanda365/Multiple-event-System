import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;
  const body = await req.json();

  const existing = await prisma.assetBorrowRent.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Record not found", 404);

  const data: Record<string, unknown> = {};
  if (body.staffUserId !== undefined) data.staffUserId = body.staffUserId || null;
  if (body.staffUserName !== undefined) data.staffUserName = body.staffUserName;
  if (body.staffUserEmail !== undefined) data.staffUserEmail = body.staffUserEmail?.trim() || null;
  if (body.assetId !== undefined) data.assetId = body.assetId || null;
  if (body.assetName !== undefined) data.assetName = body.assetName;
  if (body.assetCode !== undefined) data.assetCode = body.assetCode?.trim() || null;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
  if (body.actualReturnDate !== undefined) data.actualReturnDate = body.actualReturnDate ? new Date(body.actualReturnDate) : null;
  if (body.quantity !== undefined) data.quantity = parseInt(body.quantity, 10) || 1;
  if (body.purpose !== undefined) data.purpose = body.purpose?.trim() || null;
  if (body.status !== undefined) data.status = body.status;

  const updated = await prisma.assetBorrowRent.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;

  const existing = await prisma.assetBorrowRent.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Record not found", 404);

  await prisma.assetBorrowRent.delete({ where: { id } });
  return Response.json({ success: true });
}
