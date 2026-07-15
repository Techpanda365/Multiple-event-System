"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { month: "Jan", revenue: 18500 },
  { month: "Feb", revenue: 22300 },
  { month: "Mar", revenue: 19800 },
  { month: "Apr", revenue: 25600 },
  { month: "May", revenue: 28900 },
  { month: "Jun", revenue: 31200 },
];

export function RevenueChart() {
  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Revenue Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-2 h-40">
          {data.map((item) => (
            <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] text-muted-foreground">
                ${(item.revenue / 1000).toFixed(1)}k
              </span>
              <div
                className="w-full bg-primary/20 rounded-t-md transition-all hover:bg-primary/30"
                style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
              />
              <span className="text-[10px] text-muted-foreground">{item.month}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
