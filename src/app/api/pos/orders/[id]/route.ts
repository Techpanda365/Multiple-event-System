import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  const order = await prisma.posOrder.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { orderItems: { include: { product: { select: { id: true, name: true } } } } },
  });
  if (!order) return notFound();
  return Response.json(order);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.status) data.status = body.status;
  if (body.customerName !== undefined) data.customerName = body.customerName;

  const result = await prisma.posOrder.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data,
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  await prisma.posOrder.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
