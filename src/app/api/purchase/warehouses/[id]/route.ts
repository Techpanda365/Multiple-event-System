import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const warehouse = await prisma.warehouse.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!warehouse) return notFound("Warehouse not found");
  return Response.json(warehouse);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.warehouse.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Warehouse not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.code !== undefined) data.code = body.code;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.email !== undefined) data.email = body.email;
  if (body.country !== undefined) data.country = body.country;
  if (body.city !== undefined) data.city = body.city;
  if (body.address !== undefined) data.address = body.address;
  if (body.zipCode !== undefined) data.zipCode = body.zipCode;
  if (body.status !== undefined) data.isActive = body.status === "Active";

  const warehouse = await prisma.warehouse.update({ where: { id }, data });
  return Response.json(warehouse);
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.warehouse.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Warehouse not found");
  await prisma.warehouse.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
