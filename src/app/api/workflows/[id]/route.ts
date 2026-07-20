import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.workflow.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Workflow not found");
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.trigger !== undefined) data.trigger = body.trigger;
  if (body.actions !== undefined) data.actions = body.actions;
  if (body.conditions !== undefined) data.conditions = body.conditions;
  if (body.isActive !== undefined) data.isActive = body.isActive;
  const workflow = await prisma.workflow.update({ where: { id }, data });
  return Response.json(workflow);
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
  const existing = await prisma.workflow.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Workflow not found");
  await prisma.workflow.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
