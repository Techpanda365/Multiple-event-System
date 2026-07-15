"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const leads = [
  { id: 1, name: "Acme Corp", value: "$12,000", status: "New", email: "john@acme.com" },
  { id: 2, name: "TechStart Inc", value: "$8,500", status: "Contacted", email: "sarah@techstart.io" },
  { id: 3, name: "GlobalTech", value: "$25,000", status: "Qualified", email: "mike@globaltech.com" },
  { id: 4, name: "InnovateLab", value: "$6,000", status: "Proposal", email: "lisa@innovatelab.io" },
  { id: 5, name: "DataFlow Systems", value: "$15,000", status: "Negotiation", email: "tom@dataflow.com" },
];

const statusVariant = {
  New: "success" as const,
  Contacted: "secondary" as const,
  Qualified: "warning" as const,
  Proposal: "default" as const,
  Negotiation: "destructive" as const,
};

export function RecentLeads() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Recent Leads</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leads.map((lead) => (
          <div key={lead.id} className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{lead.name}</p>
              <p className="text-xs text-muted-foreground">{lead.email}</p>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm font-semibold">{lead.value}</span>
              <Badge variant={statusVariant[lead.status as keyof typeof statusVariant]}>
                {lead.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
