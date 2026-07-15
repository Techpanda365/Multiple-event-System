import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const expenses = await prisma.expense.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: {
      bankAccount: { select: { id: true, name: true } },
      chartOfAccount: { select: { id: true, code: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(expenses);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.date) return badRequest("Expense date is required");
  if (!body.category) return badRequest("Category is required");
  if (!body.amount || Number(body.amount) <= 0) return badRequest("Valid amount is required");

  const count = await prisma.expense.count({ where: { workspaceId: ctx.workspace.id } });
  const expenseNumber = `EXP-${String(count + 1).padStart(4, "0")}`;

  const expense = await prisma.expense.create({
    data: {
      workspaceId: ctx.workspace.id,
      expenseNumber,
      date: new Date(body.date),
      category: body.category,
      bankAccountId: body.bankAccountId || null,
      chartOfAccountId: body.chartOfAccountId || null,
      amount: Number(body.amount),
      referenceNumber: body.referenceNumber?.trim() || null,
      description: body.description?.trim() || null,
      status: body.status || "Draft",
      approvedById: ctx.user.id,
    },
    include: {
      bankAccount: { select: { id: true, name: true } },
      chartOfAccount: { select: { id: true, code: true, name: true } },
      approvedBy: { select: { id: true, name: true } },
    },
  });

  return Response.json(expense, { status: 201 });
}
