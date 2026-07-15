import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit")) || 50, 200);
  const entity = req.nextUrl.searchParams.get("entity");

  const logs = await prisma.activityLog.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(entity ? { entity } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return Response.json(logs);
}
