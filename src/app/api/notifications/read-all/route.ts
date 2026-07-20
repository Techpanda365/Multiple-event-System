import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function POST() {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  await prisma.notification.updateMany({
    where: { workspaceId: ctx.workspace.id, userId: ctx.user.id, isRead: false },
    data: { isRead: true },
  });
  return Response.json({ success: true });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
