import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, notFound, success } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return notFound("User not found");

  return success({ user });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound("User not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.role !== undefined) data.role = body.role;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.companyName !== undefined) data.companyName = body.companyName;
  if (body.password) data.passwordHash = await bcrypt.hash(body.password, 10);

  const user = await prisma.user.update({ where: { id }, data });

  return success({ user: { id: user.id, email: user.email, name: user.name, phone: user.phone, companyName: user.companyName, role: user.role, isActive: user.isActive } });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound("User not found");

  await prisma.user.delete({ where: { id } });

  return success({ success: true });
}
