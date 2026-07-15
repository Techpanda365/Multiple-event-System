import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const ticket = await prisma.helpdeskTicket.findUnique({
    where: { id },

  });
  if (!ticket) return notFound("Ticket not found");
  return Response.json(ticket);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.helpdeskTicket.findUnique({ where: { id } });
  if (!existing) return notFound("Ticket not found");
  const data: Record<string, unknown> = {};
  if (body.title !== undefined) data.title = body.title;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) data.status = body.status.toUpperCase();
  if (body.priority !== undefined) data.priority = body.priority.toUpperCase();
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;
  if (body.replies !== undefined) data.replies = body.replies;
  const ticket = await prisma.helpdeskTicket.update({ where: { id }, data });
  return Response.json(ticket);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.helpdeskTicket.findUnique({ where: { id } });
  if (!existing) return notFound("Ticket not found");
  await prisma.helpdeskTicket.delete({ where: { id } });
  return Response.json({ success: true });
}
