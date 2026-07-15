import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const product = await prisma.product.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!product) return notFound("Product not found");
  return Response.json(product);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.product.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Product not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.sku !== undefined) data.sku = body.sku;
  if (body.description !== undefined) data.description = body.description;
  if (body.shortDescription !== undefined) data.shortDescription = body.shortDescription;
  if (body.itemType !== undefined) data.itemType = body.itemType;
  if (body.productType !== undefined) data.productType = body.productType;
  if (body.warrantyInfo !== undefined) data.warrantyInfo = body.warrantyInfo;
  if (body.price !== undefined) data.price = Number(body.price);
  if (body.cost !== undefined) data.cost = Number(body.cost);
  if (body.stock !== undefined) data.stock = Number(body.stock);
  if (body.category !== undefined) data.category = body.category;
  if (body.categoryId !== undefined) {
    data.categoryId = body.categoryId;
    if (body.categoryId) {
      const cat = await prisma.productCategory.findUnique({ where: { id: body.categoryId } });
      if (cat) data.category = cat.name;
    }
  }
  if (body.taxId !== undefined) data.taxId = body.taxId;
  if (body.taxRate !== undefined) data.taxRate = Number(body.taxRate);
  if (body.image !== undefined) data.image = body.image;
  if (body.additionalImages !== undefined) data.additionalImages = body.additionalImages;
  if (body.warehouseId !== undefined) data.warehouseId = body.warehouseId;
  if (body.reorderLevel !== undefined) data.reorderLevel = body.reorderLevel != null ? Number(body.reorderLevel) : null;
  if (body.maxLevel !== undefined) data.maxLevel = body.maxLevel != null ? Number(body.maxLevel) : null;
  if (body.valuationMethod !== undefined) data.valuationMethod = body.valuationMethod;
  if (body.trackInventory !== undefined) data.trackInventory = body.trackInventory === true;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const product = await prisma.product.update({ where: { id }, data });
  return Response.json(product);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.product.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Product not found");
  await prisma.product.delete({ where: { id } });
  return Response.json({ success: true });
}
