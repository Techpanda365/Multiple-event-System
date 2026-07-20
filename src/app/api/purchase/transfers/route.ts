import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const transfers = await prisma.stockTransfer.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(transfers);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.fromWarehouseName || !body.toWarehouseName || !body.productName || !body.quantity) {
    return badRequest("fromWarehouseName, toWarehouseName, productName, and quantity are required");
  }

  const quantity = Number(body.quantity);
  if (isNaN(quantity) || quantity <= 0) return badRequest("Invalid quantity");

  let productId = body.productId || null;
  if (body.productId) {
    const product = await prisma.product.findFirst({
      where: { id: body.productId, workspaceId: ctx.workspace.id },
    });
    if (!product) return badRequest("Product not found");
    productId = product.id;
  }

  const transfer = await prisma.stockTransfer.create({
    data: {
      workspaceId: ctx.workspace.id,
      fromWarehouseId: body.fromWarehouseId || null,
      fromWarehouseName: body.fromWarehouseName,
      toWarehouseId: body.toWarehouseId || null,
      toWarehouseName: body.toWarehouseName,
      productId,
      productName: body.productName,
      quantity,
      date: body.date ? new Date(body.date) : new Date(),
      status: body.status || "Completed",
      notes: body.notes || null,
    },
  });

  return Response.json(transfer, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
