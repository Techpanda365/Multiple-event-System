import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const returns = await prisma.salesReturn.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(returns);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.customerName) return badRequest("Customer name is required");

  const items = body.items || [];
  const totalAmount = items.reduce((s: number, i: any) => s + ((i.returnQty || i.quantity || 0) * (i.unitPrice || 0)), 0);

  const count = await prisma.salesReturn.count({ where: { workspaceId: ctx.workspace.id } });
  const returnNumber = `SR-${new Date().toISOString().slice(0, 10)}-${String(count + 1).padStart(3, "0")}`;

  const ret = await prisma.salesReturn.create({
    data: {
      workspaceId: ctx.workspace.id,
      returnNumber,
      customerId: body.customerId || null,
      customerName: body.customerName,
      warehouseId: body.warehouseId || null,
      warehouseName: body.warehouseName || null,
      invoiceId: body.invoiceId || null,
      returnDate: new Date(body.returnDate) || new Date(),
      reason: body.reason || null,
      notes: body.notes || null,
      items,
      totalAmount,
      status: body.status || "Draft",
    },
  });

  return Response.json(ret, { status: 201 });
}
