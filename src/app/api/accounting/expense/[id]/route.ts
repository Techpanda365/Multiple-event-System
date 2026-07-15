import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const expense = await prisma.expense.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      bankAccount: { select: { id: true, name: true } },
      chartOfAccount: { select: { id: true, code: true, name: true } },
    },
  });

  if (!expense) return Response.json({ error: "Expense not found" }, { status: 404 });
  return Response.json(expense);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const body = await req.json();

  const expense = await prisma.expense.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!expense) return Response.json({ error: "Expense not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.description !== undefined) data.description = body.description;
  if (body.referenceNumber !== undefined) data.referenceNumber = body.referenceNumber;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.category !== undefined) data.category = body.category;
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.bankAccountId !== undefined) data.bankAccountId = body.bankAccountId;
  if (body.chartOfAccountId !== undefined) data.chartOfAccountId = body.chartOfAccountId;

  const newStatus = body.status ?? expense.status;
  if (newStatus === "Approved" && expense.status !== "Approved") {
    data.approvedById = ctx.user.id;
  }

  const updated = await prisma.expense.update({
    where: { id },
    data,
    include: {
      bankAccount: { select: { id: true, name: true } },
      chartOfAccount: { select: { id: true, code: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });

  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const expense = await prisma.expense.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!expense) return Response.json({ error: "Expense not found" }, { status: 404 });

  await prisma.expense.delete({ where: { id } });
  return Response.json({ success: true });
}
