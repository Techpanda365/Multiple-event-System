import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const doc = await prisma.document.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!doc) return notFound("Document not found");
  return Response.json(doc);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.document.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Document not found");
  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.folder !== undefined) data.folder = body.folder;
  if (body.tags !== undefined) data.tags = body.tags;
  const doc = await prisma.document.update({ where: { id }, data });
  return Response.json(doc);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.document.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Document not found");
  await prisma.document.delete({ where: { id } });
  return Response.json({ success: true });
}
