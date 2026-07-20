import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";
import { updateStock } from "@/lib/stock-helper";

function generateReturnNumber(): string {
  const now = new Date();
  const prefix = `PR-${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const rand = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${prefix}-${rand}`;
}

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const returns = await prisma.purchaseReturn.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(returns);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.vendorName) return badRequest("Vendor is required");

  const items = Array.isArray(body.items) ? body.items : [];

  const totalAmount = body.totalAmount ?? items.reduce((sum: number, item: { quantity: number; unitPrice: number }) =>
    sum + (item.quantity || 0) * (item.unitPrice || 0), 0);

  const purchaseReturn = await prisma.purchaseReturn.create({
    data: {
      workspaceId: ctx.workspace.id,
      returnNumber: body.returnNumber || generateReturnNumber(),
      vendorId: body.vendorId || null,
      vendorName: body.vendorName,
      warehouseId: body.warehouseId || null,
      warehouseName: body.warehouseName || null,
      invoiceId: body.invoiceId || null,
      returnDate: body.returnDate ? new Date(body.returnDate) : new Date(),
      reason: body.reason || null,
      notes: body.notes || null,
      items,
      totalAmount,
      status: body.status || "Draft",
    },
  });

  if (body.status !== "Draft") {
    await updateStock(items, "decrease");
  }

  return Response.json(purchaseReturn, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
