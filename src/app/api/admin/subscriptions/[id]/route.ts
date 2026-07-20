import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, notFound, success } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) return notFound("Subscription not found");

  const data: Record<string, unknown> = {};
  if (body.status !== undefined) data.status = body.status;
  if (body.cancelledAt !== undefined) data.cancelledAt = body.cancelledAt;

  const subscription = await prisma.subscription.update({ where: { id }, data });

  return success({ subscription });
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.subscription.findUnique({ where: { id } });
  if (!existing) return notFound("Subscription not found");

  await prisma.subscription.delete({ where: { id } });

  return success({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
