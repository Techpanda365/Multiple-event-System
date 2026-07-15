import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const warehouseId = req.nextUrl.searchParams.get("warehouseId");

  // All products for this workspace
  const products = await prisma.product.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      isActive: true,
      ...(warehouseId ? { warehouseId } : {}),
    },
    select: {
      id: true,
      name: true,
      sku: true,
      price: true,
      cost: true,
      stock: true,
      category: true,
      valuationMethod: true,
      reorderLevel: true,
      warehouseId: true,
    },
  });

  // All warehouses
  const warehouseRecords = await prisma.setting.findMany({
    where: { group: `warehouses:${ctx.workspace.id}` },
  });
  const warehouses = warehouseRecords.map((w) => {
    try { return { id: w.id, ...JSON.parse(w.value) }; } catch { return null; }
  }).filter(Boolean) as any[];

  // ─── Aggregate stats ──────────────────────────────────────────────────────
  const totalItems    = products.length;
  const totalQuantity = products.reduce((s, p) => s + p.stock, 0);
  const totalValue    = products.reduce((s, p) => s + (p.cost ?? p.price) * p.stock, 0);

  // ─── Valuation by Method (for donut chart) ────────────────────────────────
  const methodMap: Record<string, { count: number; value: number }> = {};
  for (const p of products) {
    const method = p.valuationMethod || "Weighted Average";
    if (!methodMap[method]) methodMap[method] = { count: 0, value: 0 };
    methodMap[method].count++;
    methodMap[method].value += (p.cost ?? p.price) * p.stock;
  }
  const valuationByMethod = Object.entries(methodMap).map(([method, data]) => ({
    method,
    count: data.count,
    value: Math.round(data.value * 100) / 100,
  }));

  // ─── Low Stock Items ──────────────────────────────────────────────────────
  const lowStockItems = products
    .filter((p) => {
      if (p.reorderLevel != null) return p.stock <= p.reorderLevel;
      return p.stock <= 10; // default threshold
    })
    .map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      stock: p.stock,
      reorderLevel: p.reorderLevel ?? 10,
    }));

  // ─── Valuation by Warehouse (for bar chart) ───────────────────────────────
  const warehouseValMap: Record<string, { name: string; value: number; qty: number }> = {};

  // Products with warehouseId
  for (const p of products) {
    const wid = p.warehouseId || "unassigned";
    const wName = warehouses.find((w) => w.id === wid)?.name || (wid === "unassigned" ? "No Warehouse" : wid);
    if (!warehouseValMap[wid]) warehouseValMap[wid] = { name: wName, value: 0, qty: 0 };
    warehouseValMap[wid].value += (p.cost ?? p.price) * p.stock;
    warehouseValMap[wid].qty   += p.stock;
  }

  const valuationByWarehouse = Object.entries(warehouseValMap).map(([id, data]) => ({
    warehouseId: id,
    warehouseName: data.name,
    value: Math.round(data.value * 100) / 100,
    quantity: data.qty,
  }));

  return Response.json({
    totalValue:    Math.round(totalValue * 100) / 100,
    totalItems,
    totalQuantity,
    valuationByMethod,
    lowStockItems,
    valuationByWarehouse,
    warehouses,   // for dropdown filter
  });
}
