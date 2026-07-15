import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, notFound, success } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!existing) return notFound("Plan not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = body.price;
  if (body.interval !== undefined) data.interval = body.interval;
  if (body.trialDays !== undefined) data.trialDays = body.trialDays;
  if (body.features !== undefined) data.features = body.features;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const plan = await prisma.subscriptionPlan.update({ where: { id }, data });

  return success({ plan });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
  if (!existing) return notFound("Plan not found");

  const subscriptions = await prisma.subscription.count({ where: { planId: id } });
  if (subscriptions > 0) return badRequest("Cannot delete plan with active subscriptions. Deactivate it instead.");

  await prisma.subscriptionPlan.delete({ where: { id } });

  return success({ success: true });
}
