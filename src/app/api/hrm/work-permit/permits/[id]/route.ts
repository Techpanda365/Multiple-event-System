import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const permit = await prisma.workPermit.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { contractor: true },
  });
  if (!permit) return notFound();
  return Response.json(permit);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.workPermit.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      type: body.type,
      location: body.location,
      description: body.description,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
      status: body.status,
      approvedBy: body.status === "ACTIVE" ? (body.approvedBy || ctx.user.id) : undefined,
      approvedAt: body.status === "ACTIVE" ? new Date() : undefined,
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
  await prisma.workPermit.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
