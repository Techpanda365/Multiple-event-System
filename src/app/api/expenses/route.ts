import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const category = req.nextUrl.searchParams.get("category");
  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");

  const where: any = { workspaceId: ctx.workspace.id };
  if (category && category !== "ALL") where.category = category;
  if (startDate || endDate) {
    where.date = {};
    if (startDate) (where.date as any).gte = new Date(startDate);
    if (endDate) (where.date as any).lte = new Date(endDate);
  }

  const expenses = await prisma.expense.findMany({
    where,
    orderBy: { date: "desc" },
  });

  return Response.json(expenses);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.category || body.amount == null) return badRequest("Category and amount are required");

  const expense = await prisma.expense.create({
    data: {
      workspaceId: ctx.workspace.id,
      category: body.category,
      amount: Number(body.amount),
      description: body.description || null,
      date: body.date ? new Date(body.date) : new Date(),
      receipt: body.receipt || null,
    },
  });

  return Response.json(expense, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
