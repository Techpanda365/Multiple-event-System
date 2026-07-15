import { prisma } from "@/lib/db";
import { requireAuth, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAuth();
  if (!ctx) return unauthorized();

  const subscription = await prisma.subscription.findFirst({
    where: { userId: ctx.user.id },
    include: { plan: true },
    orderBy: { createdAt: "desc" },
  });

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { price: "asc" },
  });

  return Response.json({ subscription, plans });
}
