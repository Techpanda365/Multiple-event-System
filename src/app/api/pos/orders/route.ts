import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

type ItemInput = { productId: string; quantity: number; price: number; total: number };

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const status = req.nextUrl.searchParams.get("status");

  const orders = await prisma.posOrder.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status ? { status: status as string } : {}),
    },
    include: {
      orderItems: { include: { product: { select: { id: true, name: true } } } },
      warehouse: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const enriched = orders.map((o) => {
    let counterName: string | null = null;
    try {
      const itemsArr = Array.isArray(o.items) ? (o.items as unknown as Record<string, unknown>[]) : [];
      const meta = itemsArr.find((i: Record<string, unknown>) => i._type === "meta");
      if (meta?.counterName) counterName = meta.counterName as string;
    } catch {}
    return {
      ...o,
      counterName,
      warehouseName: o.warehouse?.name || null,
    };
  });

  return Response.json(enriched);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return badRequest("At least one item is required");
  }

  const subtotal = body.items.reduce((s: number, i: ItemInput) => s + Number(i.total || 0), 0);
  const discount = Number(body.discount) || 0;
  const tax      = Number(body.tax) || 0;
  const total    = subtotal - discount + tax;

  const count = await prisma.posOrder.count({ where: { workspaceId: ctx.workspace.id } });
  const orderNumber = `POS-${String(count + 1).padStart(5, "0")}`;

  let counterName: string | null = null;
  if (body.counterId) {
    const counterRecord = await prisma.setting.findFirst({
      where: {
        id: body.counterId,
        group: `pos_counters:${ctx.workspace.id}`,
      },
    });
    if (counterRecord) {
      try { counterName = JSON.parse(counterRecord.value).name; } catch {}
    }
  }

  const itemsWithMeta = [
    ...body.items.map((i: ItemInput) => ({
      productId: i.productId,
      quantity:  Number(i.quantity),
      price:     Number(i.price),
      total:     Number(i.total),
    })),
    { _type: "meta", counterId: body.counterId || null, counterName },
  ];

  const order = await prisma.posOrder.create({
    data: {
      workspaceId:  ctx.workspace.id,
      orderNumber,
      customerName: body.customerName || null,
      customerId: body.customerId || null,
      warehouseId: body.warehouseId || null,
      items:        itemsWithMeta,
      subtotal,
      tax,
      total,
      status: body.status || "SUCCEEDED",
      orderItems: {
        create: body.items.map((i: ItemInput) => ({
          productId: i.productId,
          quantity:  Number(i.quantity),
          price:     Number(i.price),
          total:     Number(i.total),
        })),
      },
    },
    include: { orderItems: true },
  });

  return Response.json({ ...order, counterName }, { status: 201 });
}
