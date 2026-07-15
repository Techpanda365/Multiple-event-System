import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim();
  const category = req.nextUrl.searchParams.get("category");

  const products = await prisma.product.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(category && category !== "ALL" ? { category } : {}),
      ...(search ? { OR: [{ name: { contains: search } }, { sku: { contains: search } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(products);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Product name is required");

  let categoryName = body.category || null;

  if (body.categoryId) {
    const cat = await prisma.productCategory.findUnique({ where: { id: body.categoryId } });
    if (cat) categoryName = cat.name;
  }

  const product = await prisma.product.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      sku: body.sku || null,
      description: body.description || null,
      shortDescription: body.shortDescription || null,
      itemType: body.itemType || "Product",
      productType: body.productType || null,
      warrantyInfo: body.warrantyInfo || null,
      price: Number(body.price) || 0,
      cost: body.cost != null ? Number(body.cost) : null,
      stock: Number(body.stock || body.quantity) || 0,
      category: categoryName,
      categoryId: body.categoryId || null,
      taxId: body.taxId || null,
      taxRate: Number(body.taxRate) || 0,
      image: body.image || null,
      additionalImages: body.additionalImages || [],
      warehouseId: body.warehouseId || null,
      reorderLevel: body.reorderLevel != null ? Number(body.reorderLevel) : null,
      maxLevel: body.maxLevel != null ? Number(body.maxLevel) : null,
      valuationMethod: body.valuationMethod || "Weighted Average",
      trackInventory: body.trackInventory === true,
      isActive: body.isActive !== false,
    },
  });

  return Response.json(product, { status: 201 });
}
