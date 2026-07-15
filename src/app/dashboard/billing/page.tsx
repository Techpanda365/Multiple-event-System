import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { BillingClient } from "./billing-client";

const planMeta: Record<string, { users: string; storage: string; popular: boolean }> = {
  Starter: { users: "5", storage: "10GB", popular: false },
  Professional: { users: "25", storage: "50GB", popular: true },
  Enterprise: { users: "Unlimited", storage: "500GB", popular: false },
};

export default async function BillingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [plans, subscriptions] = await Promise.all([
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    }),
    prisma.subscription.findMany({
      where: { userId: session.user.id },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const activePlanId = subscriptions.find((s) => s.status === "SUCCEEDED")?.planId;

  return (
    <BillingClient
      plans={plans.map((plan) => {
        const meta = planMeta[plan.name] || { users: "—", storage: "—", popular: false };
        return {
          id: plan.id,
          name: plan.name,
          price: plan.price,
          interval: plan.interval === "YEARLY" ? "year" : "month",
          users: meta.users,
          storage: meta.storage,
          features: plan.features,
          popular: meta.popular,
          isCurrent: plan.id === activePlanId,
        };
      })}
      subscriptions={subscriptions
        .filter((s) => s.status === "SUCCEEDED")
        .map((sub) => ({
          id: sub.id,
          plan: sub.plan.name,
          status: "Active",
          nextBilling: sub.currentPeriodEnd
            ? sub.currentPeriodEnd.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "—",
          amount: `$${sub.plan.price}/month`,
        }))}
    />
  );
}
