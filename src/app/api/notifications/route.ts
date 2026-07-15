import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const unreadOnly = req.nextUrl.searchParams.get("unread") === "true";
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || "20"), 100);

  const notifications = await prisma.notification.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      userId: ctx.user.id,
      ...(unreadOnly ? { isRead: false } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const unreadCount = await prisma.notification.count({
    where: { workspaceId: ctx.workspace.id, userId: ctx.user.id, isRead: false },
  });

  return Response.json({ notifications, unreadCount });
}
