import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";
import { LeadStatus } from "@prisma/client";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.crmLead.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return badRequest("Lead not found");

  const body = await req.json();
  const title = body.title?.trim();
  if (title !== undefined && !title) return badRequest("Title is required");

  const lead = await prisma.crmLead.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(body.company !== undefined ? { company: body.company?.trim() || null } : {}),
      ...(body.email !== undefined ? { email: body.email?.trim() || null } : {}),
      ...(body.phone !== undefined ? { phone: body.phone?.trim() || null } : {}),
      ...(body.value !== undefined ? { value: body.value != null ? Number(body.value) : null } : {}),
      ...(body.status !== undefined ? { status: body.status as LeadStatus } : {}),
      ...(body.source !== undefined ? { source: body.source?.trim() || null } : {}),
      ...(body.assignedTo !== undefined ? { assignedTo: body.assignedTo?.trim() || null } : {}),
      ...(body.notes !== undefined ? { notes: body.notes?.trim() || null } : {}),
    },
  });

  return Response.json(lead);
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
  const existing = await prisma.crmLead.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!existing) return badRequest("Lead not found");

  await prisma.crmLead.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
