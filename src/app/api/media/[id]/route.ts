import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.mediaFile.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("File not found");
  await prisma.mediaFile.delete({ where: { id } });
  return Response.json({ success: true });
}
