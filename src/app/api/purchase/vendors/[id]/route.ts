import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const vendor = await prisma.vendor.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!vendor) return notFound("Vendor not found");
  return Response.json(vendor);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.vendor.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Vendor not found");

  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.email !== undefined) data.email = body.email;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.address !== undefined) data.address = body.address;
  if (body.city !== undefined) data.city = body.city;
  if (body.country !== undefined) data.country = body.country;
  if (body.paymentTerms !== undefined) data.paymentTerms = body.paymentTerms;
  if (body.taxId !== undefined) data.taxId = body.taxId;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const vendor = await prisma.vendor.update({ where: { id }, data });
  return Response.json(vendor);
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
  const existing = await prisma.vendor.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Vendor not found");
  await prisma.vendor.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
