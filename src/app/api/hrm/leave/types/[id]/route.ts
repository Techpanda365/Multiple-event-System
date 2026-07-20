import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.leaveType.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      name: body.name,
      daysAllowed: body.daysAllowed != null ? Number(body.daysAllowed) : undefined,
      isPaid: body.isPaid,
      carryForward: body.carryForward,
      maxCarryForward: body.maxCarryForward != null ? Number(body.maxCarryForward) : undefined,
      color: body.color,
      isActive: body.isActive,
    },
  });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.leaveType.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
