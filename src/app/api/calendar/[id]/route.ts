import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const event = await prisma.calendarEvent.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!event) return notFound("Event not found");
  return Response.json(event);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.calendarEvent.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Event not found");
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
  if (body.allDay !== undefined) data.allDay = body.allDay;
  if (body.color !== undefined) data.color = body.color;
  if (body.location !== undefined) data.location = body.location;
  const event = await prisma.calendarEvent.update({ where: { id }, data });
  return Response.json(event);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.calendarEvent.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Event not found");
  await prisma.calendarEvent.delete({ where: { id } });
  return Response.json({ success: true });
}
