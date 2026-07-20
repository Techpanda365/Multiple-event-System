import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.crmPipeline.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");
  const body = await req.json();
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name?.trim() || existing.name;
  if (body.description !== undefined) data.description = body.description?.trim() || null;
  const updated = await prisma.crmPipeline.update({ where: { id }, data });
  return Response.json(updated);
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
  const existing = await prisma.crmPipeline.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return badRequest("Not found");
  await prisma.crmPipeline.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
