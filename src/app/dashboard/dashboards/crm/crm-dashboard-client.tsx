"use client";

import type { ElementType } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Target, Users, Handshake, TrendingUp } from "lucide-react";

interface CrmDashboardData {
  totalLeads: number;
  totalDeals: number;
  openLeads: number;
  wonDeals: number;
  pipelineValue: number;
  recentLeads: { id: string; title: string; company: string | null; status: string; value: number | null }[];
  recentDeals: { id: string; name: string; company: string | null; stage: string; value: number | null; probability: number }[];
  leadsByStatus: { status: string; count: number }[];
}

interface Props {
  data: CrmDashboardData;
  user?: { name?: string | null; image?: string | null; email?: string };
}

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: ElementType }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function CrmDashboardClient({ data, user }: Props) {
  return (
    <DashboardLayout user={user} title="CRM Dashboard">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">CRM Dashboard</h2>
          <p className="text-muted-foreground">Leads, deals, and pipeline overview</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Total Leads" value={String(data.totalLeads)} icon={Target} />
          <StatCard label="Open Leads" value={String(data.openLeads)} icon={Users} />
          <StatCard label="Total Deals" value={String(data.totalDeals)} icon={Handshake} />
          <StatCard label="Pipeline Value" value={formatCurrency(data.pipelineValue)} icon={TrendingUp} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Leads by Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {data.leadsByStatus.map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <span className="text-sm">{item.status.replace("_", " ")}</span>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Recent Deals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.recentDeals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No deals yet.</p>
              ) : (
                data.recentDeals.map((deal) => (
                  <div key={deal.id} className="flex items-center justify-between border-b border-border pb-2 last:border-0">
                    <div>
                      <p className="text-sm font-medium">{deal.name}</p>
                      <p className="text-xs text-muted-foreground">{deal.company || "—"} · {deal.probability}%</p>
                    </div>
                    <span className="text-sm font-semibold">{deal.value != null ? formatCurrency(deal.value) : "—"}</span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Recent Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Lead</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentLeads.map((lead) => (
                    <tr key={lead.id} className="border-b border-border last:border-0">
                      <td className="py-3 px-2 font-medium">{lead.title}</td>
                      <td className="py-3 px-2 text-muted-foreground">{lead.company || "—"}</td>
                      <td className="py-3 px-2">{lead.status.replace("_", " ")}</td>
                      <td className="py-3 px-2">{lead.value != null ? formatCurrency(lead.value) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
