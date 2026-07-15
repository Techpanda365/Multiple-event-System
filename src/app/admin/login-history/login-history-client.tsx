// app/admin/login-history/login-history-client.tsx
"use client";

import DashboardLayout from "@/components/layout/dashboard-layout";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

type LoginEntry = {
  user: string;
  role: string;
  ip: string;
  locationDevice: string;
  time: string;
  status: string;
};

interface Props {
  history: LoginEntry[];
  user?: { id?: string; name?: string | null; email?: string; role?: string; image?: string | null } | null;
}

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-red-500/10 text-red-700",
  ADMIN: "bg-purple-500/10 text-purple-700",
  MANAGER: "bg-blue-500/10 text-blue-700",
  STAFF: "bg-green-500/10 text-green-700",
  USER: "bg-gray-500/10 text-gray-700",
};

const statusColors: Record<string, string> = {
  Success: "bg-green-500/10 text-green-700",
  Failed: "bg-red-500/10 text-red-700",
};

export function LoginHistoryClient({ history, user }: Props) {
  return (
    <DashboardLayout title="Login History" user={user}>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Login History</h1>
            <p className="text-sm text-muted-foreground">Monitor all user login activity across the system</p>
          </div>
        </div>

        <div className="rounded-lg border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">User</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">Role</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">IP Address</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">Location & Device</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">Time</th>
                <th className="text-left p-3 font-medium text-muted-foreground text-xs uppercase">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, i) => (
                <tr key={i} className="border-b border-border hover:bg-muted/50">
                  <td className="p-3 font-medium">{entry.user}</td>
                  <td className="p-3">
                    <Badge className={roleColors[entry.role] || ""}>{entry.role}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{entry.ip}</td>
                  <td className="p-3 text-muted-foreground">{entry.locationDevice}</td>
                  <td className="p-3 text-muted-foreground">{entry.time}</td>
                  <td className="p-3">
                    <Badge className={statusColors[entry.status] || ""}>{entry.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
