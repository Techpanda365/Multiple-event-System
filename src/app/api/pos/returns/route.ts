import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

function generateReturnNumber(): string {
  const now = new Date();
  const prefix = `RET-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${prefix}-${rand}`;
}

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const returns = await prisma.posReturn.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(returns);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();

  const items = Array.isArray(body.items) ? body.items : [];
  const totalAmount = body.totalAmount ?? items.reduce((sum: number, item: { total: number }) =>
    sum + (item.total || 0), 0);

  const posReturn = await prisma.posReturn.create({
    data: {
      workspaceId: ctx.workspace.id,
      returnNumber: body.returnNumber || generateReturnNumber(),
      orderId: body.orderId || null,
      customerName: body.customerName || null,
      warehouseId: body.warehouseId || null,
      warehouseName: body.warehouseName || null,
      returnDate: body.returnDate ? new Date(body.returnDate) : new Date(),
      reason: body.reason || null,
      notes: body.notes || null,
      items,
      totalAmount,
      status: body.status || "Completed",
    },
  });

  return Response.json(posReturn, { status: 201 });
}
