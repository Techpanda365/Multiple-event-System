import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const bankAccountId = req.nextUrl.searchParams.get("bankAccountId");
  const type = req.nextUrl.searchParams.get("type");

  const transactions = await prisma.bankTransaction.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(bankAccountId ? { bankAccountId } : {}),
      ...(type ? { type } : {}),
    },
    include: { bankAccount: { select: { id: true, name: true, accountNumber: true } } },
    orderBy: { date: "desc" },
  });
  return Response.json(transactions);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.bankAccountId || !body.date || !body.description || body.amount == null) {
    return badRequest("bankAccountId, date, description and amount are required");
  }

  const account = await prisma.bankAccount.findFirst({
    where: { id: body.bankAccountId, workspaceId: ctx.workspace.id },
  });
  if (!account) return badRequest("Bank account not found");

  const amount = Number(body.amount);

  const transaction = await prisma.bankTransaction.create({
    data: {
      bankAccountId: body.bankAccountId,
      workspaceId: ctx.workspace.id,
      date: new Date(body.date),
      description: body.description,
      reference: body.reference || null,
      amount,
      type: body.type || "DEBIT",
      category: body.category || null,
      status: body.status || "Completed",
    },
    include: { bankAccount: { select: { id: true, name: true, accountNumber: true } } },
  });

  await prisma.bankAccount.update({
    where: { id: body.bankAccountId },
    data: { currentBalance: { increment: amount } },
  });

  return Response.json(transaction, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
