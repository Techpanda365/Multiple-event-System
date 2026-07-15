import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const record = await prisma.attendance.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { employee: true, shift: true },
  });
  if (!record) return notFound();
  return Response.json(record);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.attendance.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      checkIn: body.checkIn ? new Date(body.checkIn) : undefined,
      checkOut: body.checkOut ? new Date(body.checkOut) : undefined,
      status: body.status,
      shiftId: body.shiftId,
      note: body.note,
    },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.attendance.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
}
