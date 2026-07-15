import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const expense = await prisma.expense.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!expense) return notFound("Expense not found");
  return Response.json(expense);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.expense.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Expense not found");

  const data: Record<string, unknown> = {};
  if (body.category !== undefined) data.category = body.category;
  if (body.amount !== undefined) data.amount = Number(body.amount);
  if (body.description !== undefined) data.description = body.description;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.receipt !== undefined) data.receipt = body.receipt;

  const expense = await prisma.expense.update({ where: { id }, data });
  return Response.json(expense);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.expense.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Expense not found");
  await prisma.expense.delete({ where: { id } });
  return Response.json({ success: true });
}
