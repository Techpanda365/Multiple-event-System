import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const item = await prisma.product.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!item) return notFound();
  return Response.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name      !== undefined) data.name      = body.name;
  if (body.sku       !== undefined) data.sku        = body.sku;
  if (body.category  !== undefined) data.category   = body.category;
  if (body.price     !== undefined) data.price      = Number(body.price);
  if (body.cost      !== undefined) data.cost       = body.cost != null ? Number(body.cost) : null;
  if (body.stock     !== undefined) data.stock      = Number(body.stock);
  if (body.isActive  !== undefined) data.isActive   = body.isActive;
  // Inventory-specific
  if (body.reorderLevel    !== undefined) data.reorderLevel    = body.reorderLevel != null ? Number(body.reorderLevel) : null;
  if (body.maxLevel        !== undefined) data.maxLevel        = body.maxLevel != null ? Number(body.maxLevel) : null;
  if (body.valuationMethod !== undefined) data.valuationMethod = body.valuationMethod;
  if (body.trackInventory  !== undefined) data.trackInventory  = Boolean(body.trackInventory);

  const result = await prisma.product.updateMany({
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
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const { id } = await params;
  await prisma.product.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
