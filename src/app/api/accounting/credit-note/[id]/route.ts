import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;

  const note = await prisma.creditNote.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: {
      salesReturn: { select: { id: true, returnNumber: true } },
      customer: { select: { id: true, name: true } },
    },
  });

  if (!note) return Response.json({ error: "Credit note not found" }, { status: 404 });
  return Response.json(note);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const body = await req.json();

  const note = await prisma.creditNote.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!note) return Response.json({ error: "Credit note not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.notes !== undefined) data.notes = body.notes;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.totalAmount !== undefined) data.totalAmount = Number(body.totalAmount);
  if (body.balance !== undefined) data.balance = Number(body.balance);
  if (body.salesReturnId !== undefined) data.salesReturnId = body.salesReturnId;
  if (body.customerId !== undefined) data.customerId = body.customerId;

  const newStatus = body.status ?? note.status;
  if (newStatus === "Approved" && note.status !== "Approved") {
    data.approvedById = ctx.user.id;
  }

  const updated = await prisma.creditNote.update({
    where: { id },
    data,
    include: {
      salesReturn: { select: { id: true, returnNumber: true } },
      customer: { select: { id: true, name: true } },
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

  const note = await prisma.creditNote.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!note) return Response.json({ error: "Credit note not found" }, { status: 404 });

  await prisma.creditNote.delete({ where: { id } });
  return Response.json({ success: true });
}
