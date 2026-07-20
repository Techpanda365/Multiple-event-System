import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const payments = await prisma.vendorPayment.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: {
      vendor: { select: { id: true, name: true, email: true } },
      bankAccount: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(payments);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.paymentDate) return badRequest("Payment date is required");
  if (!body.vendorId) return badRequest("Vendor is required");
  if (!body.amount || Number(body.amount) <= 0) return badRequest("Valid amount is required");

  const count = await prisma.vendorPayment.count({ where: { workspaceId: ctx.workspace.id } });
  const paymentNumber = `VP-${String(count + 1).padStart(4, "0")}`;

  const payment = await prisma.vendorPayment.create({
    data: {
      workspaceId: ctx.workspace.id,
      paymentNumber,
      vendorId: body.vendorId,
      bankAccountId: body.bankAccountId || null,
      paymentDate: new Date(body.paymentDate),
      amount: Number(body.amount),
      referenceNumber: body.referenceNumber?.trim() || null,
      notes: body.notes?.trim() || null,
      status: body.status || "Cleared",
    },
    include: {
      vendor: { select: { id: true, name: true, email: true } },
      bankAccount: { select: { id: true, name: true } },
    },
  });

  return Response.json(payment, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
