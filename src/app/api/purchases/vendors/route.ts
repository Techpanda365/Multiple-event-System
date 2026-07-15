import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const vendors = await prisma.vendor.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });

  return Response.json(vendors);
}
