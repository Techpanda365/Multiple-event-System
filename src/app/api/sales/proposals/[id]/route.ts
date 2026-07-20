import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const proposal = await prisma.salesProposal.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!proposal) return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(proposal);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.salesProposal.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  const items = body.items || existing.items;
  const subtotal = items.reduce((sum: number, item: any) => sum + (Number(item.qty) * Number(item.unitPrice) || 0), 0);
  const discount = Number(body.discount ?? existing.discount) || 0;
  const tax = Number(body.tax ?? existing.tax) || 0;
  const total = subtotal - discount + tax;

  const proposal = await prisma.salesProposal.update({
    where: { id },
    data: {
      ...(body.customerName && { customerName: body.customerName }),
      ...(body.customerEmail !== undefined && { customerEmail: body.customerEmail }),
      ...(body.warehouse !== undefined && { warehouse: body.warehouse }),
      ...(body.paymentTerms !== undefined && { paymentTerms: body.paymentTerms }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.specialInstructions !== undefined && { specialInstructions: body.specialInstructions }),
      ...(body.items && { items: body.items }),
      ...(body.status && { status: body.status }),
      ...(body.proposalDate && { proposalDate: new Date(body.proposalDate) }),
      ...(body.dueDate !== undefined && { dueDate: body.dueDate ? new Date(body.dueDate) : null }),
      subtotal,
      discount,
      tax,
      total,
      balance: total,
    },
  });

  return Response.json(proposal);
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.salesProposal.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return Response.json({ error: "Not found" }, { status: 404 });

  await prisma.salesProposal.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
