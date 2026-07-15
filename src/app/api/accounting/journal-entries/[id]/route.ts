import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const entry = await prisma.journalEntry.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { lines: { include: { account: true } } },
  });
  if (!entry) return notFound();
  return Response.json(entry);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.journalEntry.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound();
  if (existing.status === "POSTED") return badRequest("Cannot edit a posted journal entry");

  await prisma.journalEntry.update({
    where: { id },
    data: {
      date: body.date ? new Date(body.date) : undefined,
      description: body.description,
      reference: body.reference,
      status: body.status,
    },
  });
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const existing = await prisma.journalEntry.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound();
  if (existing.status === "POSTED") return badRequest("Cannot delete a posted entry. Void it first.");

  await prisma.journalEntry.delete({ where: { id } });
  return Response.json({ success: true });
}
