import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const records = await prisma.setting.findMany({
    where: {
      group: `inventory_adjustments:${ctx.workspace.id}`,
      ...(status ? { key: { contains: `:${status}:` } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  let adjustments = records.map((r) => {
    try { return { id: r.id, ...JSON.parse(r.value) }; } catch { return null; }
  }).filter(Boolean) as any[];

  if (search) {
    adjustments = adjustments.filter((a: any) =>
      a.number?.toLowerCase().includes(search.toLowerCase()) ||
      a.warehouseName?.toLowerCase().includes(search.toLowerCase())
    );
  }

  return Response.json(adjustments);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.adjustmentDate) return badRequest("Adjustment date is required");
  if (!Array.isArray(body.items) || body.items.length === 0) return badRequest("At least one item is required");
  if (body.items.some((i: any) => !i.productId)) return badRequest("All items must have a product selected");

  // Auto-generate adjustment number
  const count = await prisma.setting.count({
    where: { group: `inventory_adjustments:${ctx.workspace.id}` },
  });
  const adjustmentNumber = `ADJ-${String(count + 1).padStart(5, "0")}`;

  // Fetch current stock for each product
  const productIds = body.items.map((i: any) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, workspaceId: ctx.workspace.id },
    select: { id: true, name: true, sku: true, stock: true },
  });
  const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

  // Build items with current + adjusted quantities
  const itemsWithStock = body.items.map((item: any) => {
    const product = productMap[item.productId];
    const currentStock = product?.stock ?? 0;
    const qty = Number(item.quantity) || 0;
    let adjustedStock = currentStock;
    if (body.type === "Increase")  adjustedStock = currentStock + qty;
    if (body.type === "Decrease")  adjustedStock = Math.max(0, currentStock - qty);
    if (body.type === "Recount")   adjustedStock = qty;

    return {
      productId: item.productId,
      productName: product?.name || "",
      productSku: product?.sku || "",
      currentStock,
      quantity: qty,
      adjustedStock,
      notes: item.notes || "",
    };
  });

  // If status is Posted → actually update stock
  if (body.status === "Posted") {
    for (const item of itemsWithStock) {
      await prisma.product.updateMany({
        where: { id: item.productId, workspaceId: ctx.workspace.id },
        data: { stock: item.adjustedStock },
      });
    }
  }

  // Save adjustment record
  const record = await prisma.setting.create({
    data: {
      key: `adjustment:${body.status || "Draft"}:${ctx.workspace.id}:${Date.now()}`,
      value: JSON.stringify({
        number: adjustmentNumber,
        adjustmentDate: body.adjustmentDate,
        warehouseId: body.warehouseId || null,
        warehouseName: body.warehouseName || null,
        type: body.type || "Increase",
        reason: body.reason || null,
        status: body.status || "Draft",
        items: itemsWithStock,
        createdBy: ctx.user.id,
        createdAt: new Date().toISOString(),
      }),
      group: `inventory_adjustments:${ctx.workspace.id}`,
    },
  });

  return Response.json({ id: record.id, number: adjustmentNumber, ...JSON.parse(record.value) }, { status: 201 });
}
