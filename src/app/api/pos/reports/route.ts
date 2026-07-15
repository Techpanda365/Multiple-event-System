import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const from = req.nextUrl.searchParams.get("from");
  const to   = req.nextUrl.searchParams.get("to");

  const dateFilter: Record<string, Date> = {};
  if (from) dateFilter.gte = new Date(from);
  if (to)   dateFilter.lte = new Date(to + "T23:59:59");

  const orders = await prisma.posOrder.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      status: "SUCCEEDED",
      ...(Object.keys(dateFilter).length ? { createdAt: dateFilter } : {}),
    },
    include: {
      orderItems: {
        include: { product: { select: { id: true, name: true, category: true, cost: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // ─── Total stats ──────────────────────────────────────────────────────────
  const totalRevenue  = orders.reduce((s, o) => s + o.total, 0);
  const totalOrders   = orders.length;
  const totalItems    = orders.reduce((s, o) => s + o.orderItems.reduce((ss, i) => ss + i.quantity, 0), 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // ─── Sales by date ────────────────────────────────────────────────────────
  const salesByDate: Record<string, number> = {};
  for (const order of orders) {
    const d = new Date(order.createdAt).toISOString().slice(0, 10);
    salesByDate[d] = (salesByDate[d] || 0) + order.total;
  }
  const salesChart = Object.entries(salesByDate)
    .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // ─── Top products ─────────────────────────────────────────────────────────
  const productMap: Record<string, { name: string; category: string | null; qty: number; revenue: number; cogs: number }> = {};
  for (const order of orders) {
    for (const item of order.orderItems) {
      const pid = item.productId;
      if (!productMap[pid]) {
        productMap[pid] = {
          name: item.product?.name || "Unknown",
          category: item.product?.category || null,
          qty: 0, revenue: 0, cogs: 0,
        };
      }
      productMap[pid].qty     += item.quantity;
      productMap[pid].revenue += item.total;
      productMap[pid].cogs    += (item.product?.cost ?? item.price) * item.quantity;
    }
  }
  const topProducts = Object.entries(productMap)
    .map(([id, d]) => ({ productId: id, ...d, profit: d.revenue - d.cogs }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // ─── Top customers ────────────────────────────────────────────────────────
  const customerMap: Record<string, { name: string; orders: number; spent: number }> = {};
  for (const order of orders) {
    const name = order.customerName || "Walk-in Customer";
    if (!customerMap[name]) customerMap[name] = { name, orders: 0, spent: 0 };
    customerMap[name].orders++;
    customerMap[name].spent += order.total;
  }
  const topCustomers = Object.values(customerMap)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 10);

  return Response.json({
    totalRevenue:  Math.round(totalRevenue * 100) / 100,
    totalOrders,
    totalItems,
    avgOrderValue: Math.round(avgOrderValue * 100) / 100,
    salesChart,
    topProducts,
    topCustomers,
  });
}
