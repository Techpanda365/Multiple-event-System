// app/dashboard/_components/admin-dashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  DollarSign,
  LayoutGrid,
  Building2,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface AdminDashboardProps {
  workspaceCount: number;
  userCount: number;
  totalRevenue: number;
  user?: any;
}

// Tickets data (fetched from API)
interface Ticket {
  id: string;
  ticketId: string;
  priority: string;
  status: string;
  title: string;
  category?: { name: string } | null;
  from?: string;
  createdAt: string;
}

const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    Urgent: "bg-red-500/10 text-red-600 border-red-500/20",
    High: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    Medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
    Low: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  };
  return colors[priority] || "bg-gray-500/10 text-gray-600";
};

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    Open: "bg-green-500/10 text-green-600",
    "In progress": "bg-blue-500/10 text-blue-600",
    Resolved: "bg-purple-500/10 text-purple-600",
    Closed: "bg-gray-500/10 text-gray-600",
  };
  return colors[status] || "bg-gray-500/10 text-gray-600";
};

const getStatusIcon = (status: string) => {
  if (status === "Open" || status === "In progress") {
    return <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />;
  }
  if (status === "Resolved") {
    return <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />;
  }
  return <Clock className="h-4 w-4 text-gray-500 flex-shrink-0" />;
};

export function AdminDashboard({
  workspaceCount,
  userCount,
  totalRevenue,
  user,
}: AdminDashboardProps) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/helpdesk/tickets")
      .then((r) => r.json())
      .then((res) => {
        if (res.data?.tickets) setTickets(res.data.tickets);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      title: "Total Users",
      value: userCount,
      icon: ShoppingBag,
      description: "Registered users",
      color: "text-blue-500",
    },
    {
      title: "Total Revenue",
      value: `$${(totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      description: "Total payments",
      color: "text-green-500",
    },
    {
      title: "Total Workspaces",
      value: workspaceCount,
      icon: LayoutGrid,
      description: "Active workspaces",
      color: "text-purple-500",
    },
    {
      title: "Total Companies",
      value: workspaceCount,
      icon: Building2,
      description: "Registered companies",
      color: "text-orange-500",
    },
  ];

  return (
    <DashboardLayout user={user} title="System Overview">
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back, {user?.name || "Super Admin"}! Here's your system overview.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tickets Section */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Open Tickets */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-500" />
                Open Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No tickets found</p>
              ) : (
                <div className="space-y-3">
                  {tickets.filter((t: any) => t.status === "Open").slice(0, 5).map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/5 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{ticket.ticketId || ticket.id}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{ticket.title}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                            <span>Category: {ticket.category?.name || "—"}</span>
                          </div>
                        </div>
                        {getStatusIcon(ticket.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Helpdesk Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Recent Helpdesk Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No recent activity</p>
              ) : (
                <div className="space-y-3">
                  {tickets.slice(0, 5).map((ticket: any) => (
                    <div
                      key={ticket.id}
                      className="p-3 rounded-lg border border-border hover:bg-muted/5 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{ticket.ticketId || ticket.id}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPriorityColor(
                                ticket.priority
                              )}`}
                            >
                              {ticket.priority}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(
                                ticket.status
                              )}`}
                            >
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-sm font-medium truncate">{ticket.title}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-muted-foreground">
                            <span>Category: {ticket.category?.name || "—"}</span>
                          </div>
                        </div>
                        {getStatusIcon(ticket.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}