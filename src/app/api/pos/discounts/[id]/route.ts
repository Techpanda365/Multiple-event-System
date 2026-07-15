import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.posDiscount.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound();

  const record = await prisma.posDiscount.update({
    where: { id },
    data: {
      name: body.name?.trim(),
      applyOn: body.applyOn,
      discountType: body.discountType,
      value: body.value !== undefined ? Number(body.value) : undefined,
      minimumQuantity: body.minimumQuantity !== undefined ? Number(body.minimumQuantity) : undefined,
      startDate: body.startDate !== undefined ? (body.startDate ? new Date(body.startDate) : null) : undefined,
      endDate: body.endDate !== undefined ? (body.endDate ? new Date(body.endDate) : null) : undefined,
      productIds: body.productIds !== undefined ? body.productIds : undefined,
      selectedCategory: body.selectedCategory !== undefined ? body.selectedCategory : undefined,
      isActive: body.isActive !== undefined ? body.isActive : undefined,
    },
  });
  return Response.json(record);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAnySession();
  if (!ctx || !ctx.workspace) return unauthorized();
  const { id } = await params;
  await prisma.posDiscount.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
}
