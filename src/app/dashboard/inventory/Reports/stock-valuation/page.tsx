"use client";

import { useState, useEffect, useCallback } from "react";
import DashboardLayout from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Package, Layers, AlertTriangle, Loader2 } from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type Warehouse      = { id: string; name: string };
type ValByMethod    = { method: string; count: number; value: number };
type LowStockItem   = { id: string; name: string; sku: string | null; stock: number; reorderLevel: number };
type ValByWarehouse = { warehouseId: string; warehouseName: string; value: number; quantity: number };

type ReportData = {
  totalValue:          number;
  totalItems:          number;
  totalQuantity:       number;
  valuationByMethod:   ValByMethod[];
  lowStockItems:       LowStockItem[];
  valuationByWarehouse: ValByWarehouse[];
  warehouses:          Warehouse[];
};

// ─── Colors ───────────────────────────────────────────────────────────────────
const METHOD_COLORS: Record<string, string> = {
  "FIFO":             "#3b82f6",
  "LIFO":             "#f59e0b",
  "Weighted Average": "#8b5cf6",
  "Standard Cost":    "#10b981",
};
const FALLBACK_COLORS = ["#3b82f6","#f59e0b","#8b5cf6","#10b981","#ef4444"];

const fmt = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n);

// Custom donut label
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {value}
    </text>
  );
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function StockValuationPage() {
  const [data, setData]               = useState<ReportData | null>(null);
  const [loading, setLoading]         = useState(true);
  const [selectedWarehouse, setSelectedWarehouse] = useState("");

  const fetchReport = useCallback(async (warehouseId?: string) => {
    setLoading(true);
    try {
      const params = warehouseId ? `?warehouseId=${warehouseId}` : "";
      const res = await fetch(`/api/inventory/reports/stock-valuation${params}`);
      if (res.ok) setData(await res.json());
    } catch { }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleApply = () => fetchReport(selectedWarehouse || undefined);
  const handleClear = () => { setSelectedWarehouse(""); fetchReport(); };

  return (
    <DashboardLayout title="Stock Valuation Report">
      <div className="space-y-5">

        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold">Manage Stock Valuation Report</h1>
        </div>

        {/* Warehouse Filter */}
        <Card>
          <CardContent className="py-4 px-5">
            <div className="flex items-end gap-3 flex-wrap">
              <div className="flex-1 min-w-48 max-w-sm space-y-1">
                <label className="text-sm font-medium text-muted-foreground">Warehouse</label>
                <select
                  value={selectedWarehouse}
                  onChange={(e) => setSelectedWarehouse(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">All Warehouses</option>
                  {data?.warehouses.map((w) => (
                    <option key={w.id} value={w.id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <Button onClick={handleApply} className="bg-teal-600 hover:bg-teal-700 text-white px-5">
                Apply
              </Button>
              <Button variant="outline" onClick={handleClear} className="px-5">
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? (
          <div className="text-center py-16 text-muted-foreground">Failed to load report</div>
        ) : (
          <>
            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              {/* Total Value */}
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Total Value</p>
                      <p className="text-3xl font-bold text-blue-700 mt-1">
                        {fmt(data.totalValue)}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Items */}
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-medium uppercase tracking-wider">Total Items</p>
                      <p className="text-3xl font-bold text-green-700 mt-1">{data.totalItems}</p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Package className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Total Quantity */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="pt-5 pb-4 px-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-purple-600 font-medium uppercase tracking-wider">Total Quantity</p>
                      <p className="text-3xl font-bold text-purple-700 mt-1">
                        {data.totalQuantity.toLocaleString()}
                      </p>
                    </div>
                    <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Layers className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── Charts Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

              {/* Valuation by Method — Donut */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="text-base">⊙</span> Valuation by Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.valuationByMethod.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
                      No data available
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={data.valuationByMethod}
                          dataKey="value"
                          nameKey="method"
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={110}
                          labelLine={false}
                          label={renderCustomLabel}
                        >
                          {data.valuationByMethod.map((entry, index) => (
                            <Cell
                              key={entry.method}
                              fill={METHOD_COLORS[entry.method] || FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [fmt(value), name]}
                        />
                        <Legend
                          formatter={(value) => (
                            <span style={{ fontSize: 12, color: "#6b7280" }}>{value}</span>
                          )}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              {/* Low Stock Items */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" /> Low Stock Items
                    </span>
                    {data.lowStockItems.length > 0 && (
                      <Badge className="bg-red-500/10 text-red-600 text-xs">
                        {data.lowStockItems.length}
                      </Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.lowStockItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm">
                      <Package className="h-8 w-8 mb-2 opacity-30" />
                      All items are adequately stocked
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {data.lowStockItems.map((item) => (
                        <div key={item.id}
                          className="flex items-center justify-between rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              Stock: <span className="font-semibold text-red-600">{item.stock}</span>
                              {" · "}Reorder: <span className="font-semibold">{item.reorderLevel}</span>
                            </p>
                          </div>
                          <Badge className="ml-3 flex-shrink-0 bg-yellow-400/20 text-yellow-700 text-[10px]">
                            Low Stock
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ── Valuation by Warehouse — Bar Chart ── */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <span className="text-base">⊞</span> Valuation by Warehouse
                </CardTitle>
              </CardHeader>
              <CardContent>
                {data.valuationByWarehouse.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                    No warehouse data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart
                      data={data.valuationByWarehouse}
                      margin={{ top: 10, right: 20, left: 20, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="warehouseName"
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                        height={70}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "#6b7280" }}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(value: number) => [fmt(value), "Value"]}
                        labelStyle={{ fontSize: 12 }}
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={60} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
