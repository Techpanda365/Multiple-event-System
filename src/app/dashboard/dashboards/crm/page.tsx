import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { CrmDashboardClient } from "./crm-dashboard-client";

export default async function CrmDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const [leads, deals] = await Promise.all([
    prisma.crmLead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.crmDeal.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const openLeads = leads.filter((l) => !["WON", "LOST"].includes(l.status)).length;
  const wonDeals = deals.filter((d) => d.stage === "closed_won").length;
  const pipelineValue = deals
    .filter((d) => !["closed_won", "closed_lost"].includes(d.stage))
    .reduce((sum, d) => sum + (d.value || 0), 0);

  const statusCounts = leads.reduce<Record<string, number>>((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <CrmDashboardClient
      user={session.user}
      data={{
        totalLeads: leads.length,
        totalDeals: deals.length,
        openLeads,
        wonDeals,
        pipelineValue,
        leadsByStatus: Object.entries(statusCounts).map(([status, count]) => ({ status, count })),
        recentLeads: leads.slice(0, 6).map((l) => ({
          id: l.id,
          title: l.title,
          company: l.company,
          status: l.status,
          value: l.value,
        })),
        recentDeals: deals.slice(0, 5).map((d) => ({
          id: d.id,
          name: d.name,
          company: d.company,
          stage: d.stage,
          value: d.value,
          probability: d.probability,
        })),
      }}
    />
  );
}
