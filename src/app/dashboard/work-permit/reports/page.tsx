// app/dashboard/work-permit/reports/page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar,
  Filter,
  X,
  FileText,
  Shield,
  Clock,
  CheckCircle,
  AlertTriangle,
  Users,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";

const COLORS = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#6366f1"];
const APPROVAL_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#3b82f6"];

const approvalStatusColors: Record<string, string> = {
  Pending: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400",
  Approved: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Rejected: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
  "Under Review": "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
};

const statusColors: Record<string, string> = {
  Active: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-400",
  Draft: "bg-gray-500/10 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400",
  Completed: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400",
  Cancelled: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-400",
};

// Simple Select component
const SimpleSelect = ({ value, onValueChange, children, placeholder }: any) => {
  return (
    <select
      value={value}
      onChange={(e) => onValueChange(e.target.value)}
      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
    >
      <option value="">{placeholder || "Select..."}</option>
      {children}
    </select>
  );
};

interface Permit {
  id: string;
  permitNumber: string;
  permitType: string;
  location: string;
  contractor: string;
  startDate: string;
  endDate: string;
  approvalStatus: string;
  status: string;
}

export default function WorkPermitReportsPage() {
  const [permitTypeData, setPermitTypeData] = useState<{ name: string; value: number }[]>([]);
  const [approvalStatusData, setApprovalStatusData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<{ month: string; permits: number }[]>([]);
  const [recentPermits, setRecentPermits] = useState<Permit[]>([]);
  const [stats, setStats] = useState<{ title: string; value: number; icon: any; color: string }[]>([]);

  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    contractor: "",
  });

  useEffect(() => {
    fetch('/api/work-permit/reports')
      .then(res => res.json())
      .then(data => {
        if (data.permitTypes) setPermitTypeData(data.permitTypes);
        if (data.approvalStatus) setApprovalStatusData(data.approvalStatus);
        if (data.monthlyTrend) setMonthlyTrendData(data.monthlyTrend);
        if (data.recentPermits) setRecentPermits(data.recentPermits);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {
        setPermitTypeData([]);
        setApprovalStatusData([]);
        setMonthlyTrendData([]);
        setRecentPermits([]);
        setStats([]);
      });
  }, []);

  const handleApplyFilters = () => {
    console.log("Filters applied:", filters);
  };

  const handleClearFilters = () => {
    setFilters({ startDate: "", endDate: "", contractor: "" });
  };

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Manage Work Permit Report</h1>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-6">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                    placeholder="Select start date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                    placeholder="Select end date"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Contractor</label>
                  <SimpleSelect
                    value={filters.contractor}
                    onValueChange={(value: string) =>
                      setFilters({ ...filters, contractor: value })
                    }
                    placeholder="All Contractors"
                  >
                    <option value="all">All Contractors</option>
                    <option value="alpha">Alpha Industrial Services</option>
                    <option value="skyline">Skyline Electrical Ltd</option>
                    <option value="prime">Prime Mechanical Works</option>
                    <option value="safelift">Safelift Crane Services</option>
                  </SimpleSelect>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters}>Apply</Button>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

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
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Permits by Type - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                Permits by Type
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={permitTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {permitTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Permits by Approval Status - Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <PieChart className="h-4 w-4 text-primary" />
                Permits by Approval Status
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={approvalStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => 
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {approvalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={APPROVAL_COLORS[index % APPROVAL_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: "12px" }} />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly Permit Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Monthly Permit Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="permits"
                  stroke="#3b82f6"
                  fill="#3b82f6/0.1"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Work Permits Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              Recent Work Permits
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-lg border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border">
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Permit Number
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Permit Type
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Location
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Contractor
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Approval Status
                      </th>
                      <th className="text-left p-3 md:p-4 font-medium text-muted-foreground text-xs uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPermits.map((permit, index) => (
                      <tr
                        key={permit.id}
                        className={`border-b border-border last:border-0 hover:bg-muted/5 transition-colors ${
                          index % 2 === 0 ? "bg-background" : "bg-muted/5"
                        }`}
                      >
                        <td className="p-3 md:p-4">
                          <span className="font-medium text-sm">{permit.permitNumber}</span>
                        </td>
                        <td className="p-3 md:p-4">
                          <span className="text-sm">{permit.permitType}</span>
                        </td>
                        <td className="p-3 md:p-4">
                          <span className="text-sm">{permit.location}</span>
                        </td>
                        <td className="p-3 md:p-4">
                          <span className="text-sm">{permit.contractor}</span>
                        </td>
                        <td className="p-3 md:p-4">
                          <span className="text-sm">{permit.startDate}</span>
                        </td>
                        <td className="p-3 md:p-4">
                          <span className="text-sm">{permit.endDate}</span>
                        </td>
                        <td className="p-3 md:p-4">
                          <Badge className={approvalStatusColors[permit.approvalStatus]}>
                            {permit.approvalStatus}
                          </Badge>
                        </td>
                        <td className="p-3 md:p-4">
                          <Badge className={statusColors[permit.status]}>
                            {permit.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}