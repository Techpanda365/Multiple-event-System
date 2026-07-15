import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, notFound, success } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) return notFound("Coupon not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.type !== undefined) data.type = body.type;
  if (body.discount !== undefined) data.discount = body.discount;
  if (body.usageLimit !== undefined) data.usageLimit = body.usageLimit;
  if (body.limitPerUser !== undefined) data.limitPerUser = body.limitPerUser;
  if (body.minSpend !== undefined) data.minSpend = body.minSpend;
  if (body.maxSpend !== undefined) data.maxSpend = body.maxSpend;
  if (body.description !== undefined) data.description = body.description;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.expiryDate !== undefined) data.expiryDate = body.expiryDate ? new Date(body.expiryDate) : null;

  const coupon = await prisma.coupon.update({ where: { id }, data });

  return success({ coupon });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.coupon.findUnique({ where: { id } });
  if (!existing) return notFound("Coupon not found");

  await prisma.coupon.delete({ where: { id } });

  return success({ success: true });
}
