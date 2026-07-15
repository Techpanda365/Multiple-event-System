// app/dashboard/sales/reports/opportunities/page.tsx
"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from "recharts";

const COLORS = ["#ef4444", "#22c55e", "#f59e0b", "#3b82f6", "#8b5cf6"];

export default function OpportunityReportsPage() {
  const [monthlyData, setMonthlyData] = useState<{ month: string; opportunities: number }[]>([]);
  const [stageData, setStageData] = useState<{ name: string; value: number }[]>([]);
  const [stats, setStats] = useState<{ title: string; value: string; icon: any; description: string }[]>([]);

  useEffect(() => {
    fetch('/api/sales/opportunities/reports')
      .then(res => res.json())
      .then(data => {
        if (data.monthly) setMonthlyData(data.monthly);
        if (data.stages) setStageData(data.stages);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {
        setMonthlyData([]);
        setStageData([]);
        setStats([]);
      });
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4 md:p-6 space-y-6 bg-background">
        <div><h1 className="text-2xl font-bold tracking-tight">Opportunity Reports</h1></div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{stat.value}</div><p className="text-xs text-muted-foreground mt-1">{stat.description}</p></CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><PieChart className="h-4 w-4 text-primary" />Opportunity Stage Distribution</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie data={stageData} cx="50%" cy="50%" labelLine={false} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {stageData.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Legend />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-sm font-medium flex items-center gap-2"><BarChart3 className="h-4 w-4 text-primary" />Per Month Opportunities</CardTitle></CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }} />
                  <Bar dataKey="opportunities" fill="#ec4899" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}