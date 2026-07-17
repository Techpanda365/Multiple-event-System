import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const result = await prisma.setting.deleteMany({ where: { id, group: `retainer-payments:${ctx.workspace.id}` } });
  if (result.count === 0) return notFound();
  return Response.json({ success: true });
}
