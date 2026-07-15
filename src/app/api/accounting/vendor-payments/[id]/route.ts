import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const payment = await prisma.vendorPayment.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      vendor: { select: { id: true, name: true, email: true } },
      bankAccount: { select: { id: true, name: true } },
    },
  });

  if (!payment) return Response.json({ error: "Payment not found" }, { status: 404 });
  return Response.json(payment);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const body = await req.json();

  const payment = await prisma.vendorPayment.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!payment) return Response.json({ error: "Payment not found" }, { status: 404 });

  const updated = await prisma.vendorPayment.update({
    where: { id },
    data: {
      status: body.status || payment.status,
      referenceNumber: body.referenceNumber ?? payment.referenceNumber,
      notes: body.notes ?? payment.notes,
    },
    include: {
      vendor: { select: { id: true, name: true, email: true } },
      bankAccount: { select: { id: true, name: true } },
    },
  });

  return Response.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const payment = await prisma.vendorPayment.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });

  if (!payment) return Response.json({ error: "Payment not found" }, { status: 404 });

  await prisma.vendorPayment.delete({ where: { id } });
  return Response.json({ success: true });
}
