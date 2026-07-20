import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const payment = await prisma.customerPayment.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      bankAccount: { select: { id: true, name: true } },
    },
  });

  if (!payment) return Response.json({ error: "Payment not found" }, { status: 404 });
  return Response.json(payment);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const body = await req.json();

  const payment = await prisma.customerPayment.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!payment) return Response.json({ error: "Payment not found" }, { status: 404 });

  const updated = await prisma.customerPayment.update({
    where: { id },
    data: {
      status: body.status || payment.status,
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      bankAccount: { select: { id: true, name: true } },
    },
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

  const payment = await prisma.customerPayment.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });

  if (!payment) return Response.json({ error: "Payment not found" }, { status: 404 });

  await prisma.customerPayment.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
