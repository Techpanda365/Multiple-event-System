import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;
  const body = await req.json();

  const existing = await prisma.location.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Location not found", 404);

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name.trim() || "";
  if (body.code !== undefined) data.code = body.code.trim() || "";
  if (body.type !== undefined) data.type = body.type.trim();
  if (body.parentLocation !== undefined) data.parentLocation = body.parentLocation?.trim() || null;
  if (body.address !== undefined) data.address = body.address?.trim() || null;
  if (body.city !== undefined) data.city = body.city?.trim() || null;
  if (body.state !== undefined) data.state = body.state?.trim() || null;
  if (body.country !== undefined) data.country = body.country?.trim() || null;
  if (body.postalCode !== undefined) data.postalCode = body.postalCode?.trim() || null;
  if (body.contactPerson !== undefined) data.contactPerson = body.contactPerson?.trim() || null;
  if (body.contactPhone !== undefined) data.contactPhone = body.contactPhone?.trim() || null;
  if (body.contactEmail !== undefined) data.contactEmail = body.contactEmail?.trim() || null;
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const updated = await prisma.location.update({ where: { id }, data });
  return Response.json(updated);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const id = (await params).id;

  const existing = await prisma.location.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Location not found", 404);

  await prisma.location.delete({ where: { id } });
  return Response.json({ success: true });
}
