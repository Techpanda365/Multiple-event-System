import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.reminder.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Reminder not found");
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.dueDate !== undefined) data.dueDate = new Date(body.dueDate);
  if (body.priority !== undefined) data.priority = body.priority;
  if (body.status !== undefined) data.status = body.status;
  if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo;
  const reminder = await prisma.reminder.update({ where: { id }, data });
  return Response.json(reminder);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.reminder.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Reminder not found");
  await prisma.reminder.delete({ where: { id } });
  return Response.json({ success: true });
}
