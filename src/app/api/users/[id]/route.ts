import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound, success } from "@/lib/api-auth";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: id, workspaceId: ctx.workspace.id } },
  });
  if (!member) return notFound("User not in workspace");

  if (body.role) {
    await prisma.workspaceMember.update({
      where: { id: member.id },
      data: { role: body.role },
    });
  }

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.phone !== undefined) updateData.phone = body.phone;
  if (body.isActive !== undefined) updateData.isActive = body.isActive;

  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({ where: { id }, data: updateData });
  }

  return success({ success: true });
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
  const member = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: id, workspaceId: ctx.workspace.id } },
  });
  if (!member) return notFound("User not in workspace");

  await prisma.workspaceMember.delete({ where: { id: member.id } });
  return success({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
