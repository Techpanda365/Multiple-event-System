import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.crmDeal.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return badRequest("Deal not found");

  const body = await req.json();
  const name = body.name?.trim();
  if (name !== undefined && !name) return badRequest("Name is required");

  const deal = await prisma.crmDeal.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(body.company !== undefined ? { company: body.company?.trim() || null } : {}),
      ...(body.email !== undefined ? { email: body.email?.trim() || null } : {}),
      ...(body.phone !== undefined ? { phone: body.phone?.trim() || null } : {}),
      ...(body.value !== undefined ? { value: body.value != null ? Number(body.value) : null } : {}),
      ...(body.stage !== undefined ? { stage: body.stage?.trim() || "lead" } : {}),
      ...(body.probability !== undefined ? { probability: Number(body.probability) || 0 } : {}),
      ...(body.source !== undefined ? { source: body.source?.trim() || null } : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo?.trim() || null } : {}),
      ...(body.notes !== undefined ? { notes: body.notes?.trim() || null } : {}),
    },
  });

  return Response.json(deal);
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.crmDeal.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return badRequest("Deal not found");

  await prisma.crmDeal.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
