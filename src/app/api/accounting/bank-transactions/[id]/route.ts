import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const tx = await prisma.bankTransaction.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { bankAccount: { select: { id: true, name: true, accountNumber: true } } },
  });
  if (!tx) return notFound();
  return Response.json(tx);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const existing = await prisma.bankTransaction.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return notFound();

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.date) data.date = new Date(body.date);
  if (body.description !== undefined) data.description = body.description;
  if (body.reference !== undefined) data.reference = body.reference;
  if (body.amount != null) data.amount = Number(body.amount);
  if (body.type) data.type = body.type;
  if (body.status) data.status = body.status;
  if (body.category !== undefined) data.category = body.category;
  if (body.reconciled !== undefined) data.reconciled = Boolean(body.reconciled);

  const updated = await prisma.bankTransaction.update({
    where: { id },
    data,
    include: { bankAccount: { select: { id: true, name: true, accountNumber: true } } },
  });

  return Response.json(updated);
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const existing = await prisma.bankTransaction.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return notFound();

  await prisma.bankTransaction.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
