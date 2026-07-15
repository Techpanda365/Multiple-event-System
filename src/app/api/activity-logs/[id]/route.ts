import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;

  const log = await prisma.activityLog.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
  });
  if (!log) return notFound();
  return Response.json(log);
}
