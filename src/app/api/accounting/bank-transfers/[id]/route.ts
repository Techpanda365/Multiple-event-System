import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const transfer = await prisma.bankTransfer.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      fromAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
      toAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
    },
  });
  if (!transfer) return notFound();
  return Response.json(transfer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const existing = await prisma.bankTransfer.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return notFound();

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.date) data.date = new Date(body.date);
  if (body.fromAccountId) data.fromAccountId = body.fromAccountId;
  if (body.toAccountId) data.toAccountId = body.toAccountId;
  if (body.amount != null) data.amount = Number(body.amount);
  if (body.charges != null) data.charges = Number(body.charges);
  if (body.reference !== undefined) data.reference = body.reference;
  if (body.description !== undefined) data.description = body.description;
  if (body.status) data.status = body.status;

  const updated = await prisma.bankTransfer.update({
    where: { id },
    data,
    include: {
      fromAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
      toAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
    },
  });
  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const existing = await prisma.bankTransfer.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return notFound();

  await prisma.bankTransfer.delete({ where: { id } });
  return Response.json({ success: true });
}
