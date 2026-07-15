import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const transfers = await prisma.bankTransfer.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: {
      fromAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
      toAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
    },
    orderBy: { date: "desc" },
  });
  return Response.json(transfers);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.fromAccountId || !body.toAccountId) return badRequest("From and To accounts are required");
  if (!body.date) return badRequest("Date is required");
  if (!body.amount || Number(body.amount) <= 0) return badRequest("Valid amount is required");

  const fromAccount = await prisma.bankAccount.findFirst({
    where: { id: body.fromAccountId, workspaceId: ctx.workspace.id },
  });
  if (!fromAccount) return badRequest("From account not found");

  const toAccount = await prisma.bankAccount.findFirst({
    where: { id: body.toAccountId, workspaceId: ctx.workspace.id },
  });
  if (!toAccount) return badRequest("To account not found");

  const amount = Number(body.amount);
  const charges = Number(body.charges) || 0;

  const count = await prisma.bankTransfer.count({ where: { workspaceId: ctx.workspace.id } });
  const transferNumber = `BT-${String(count + 1).padStart(4, "0")}`;

  const transfer = await prisma.bankTransfer.create({
    data: {
      workspaceId: ctx.workspace.id,
      transferNumber,
      date: new Date(body.date),
      fromAccountId: body.fromAccountId,
      toAccountId: body.toAccountId,
      amount,
      charges,
      reference: body.reference?.trim() || null,
      description: body.description?.trim() || null,
      status: body.status || "Pending",
    },
    include: {
      fromAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
      toAccount: { select: { id: true, name: true, accountNumber: true, currentBalance: true } },
    },
  });

  await prisma.bankAccount.update({
    where: { id: body.fromAccountId },
    data: { currentBalance: { decrement: amount } },
  });
  await prisma.bankAccount.update({
    where: { id: body.toAccountId },
    data: { currentBalance: { increment: amount } },
  });

  return Response.json(transfer, { status: 201 });
}
