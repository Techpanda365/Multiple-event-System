import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const accounts = await prisma.bankAccount.findMany({
    where: { workspaceId: ctx.workspace.id, isActive: true },
    orderBy: { name: "asc" },
  });
  return Response.json(accounts);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.accountNumber?.trim()) return badRequest("Account number is required");
  if (!body.name?.trim()) return badRequest("Account name is required");

  const openingBalance = Number(body.openingBalance) || 0;

  const account = await prisma.bankAccount.create({
    data: {
      workspaceId:   ctx.workspace.id,
      name:          body.name.trim(),
      accountNumber: body.accountNumber.trim(),
      bankName:      body.bankName?.trim() || null,
      branchName:    body.branchName?.trim() || null,
      type:          body.type || "CHECKING",
      glAccount:     body.glAccount?.trim() || null,
      paymentGateway: body.paymentGateway?.trim() || null,
      currency:      body.currency || "USD",
      openingBalance,
      currentBalance: openingBalance,
      iban:          body.iban?.trim() || null,
      swiftCode:     body.swiftCode?.trim() || null,
      routingNumber: body.routingNumber?.trim() || null,
      isActive:      body.isActive !== false,
    },
  });

  return Response.json(account, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
