import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const returns = await prisma.salesReturn.findMany({
    where: { workspaceId: ctx.workspace.id },
    select: { id: true, returnNumber: true, customerName: true, totalAmount: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(returns);
}
