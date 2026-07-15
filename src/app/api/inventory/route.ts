import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const lowStock = req.nextUrl.searchParams.get("lowStock");
  const category = req.nextUrl.searchParams.get("category");
  const search   = req.nextUrl.searchParams.get("search")?.trim();

  const where: Record<string, unknown> = { workspaceId: ctx.workspace.id };
  if (lowStock === "true") where.stock = { lte: 10 };
  if (category && category !== "ALL") where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { sku: { contains: search } },
    ];
  }

  const items = await prisma.product.findMany({
    where,
    select: {
      id: true, name: true, sku: true, category: true,
      price: true, cost: true, stock: true, isActive: true,
      reorderLevel: true, maxLevel: true,
      valuationMethod: true, trackInventory: true,
      createdAt: true,
    },
    orderBy: { name: "asc" },
  });

  return Response.json(items);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const { action, productId, quantity } = body;

  if (action === "adjust") {
    if (!productId || quantity == null) return badRequest("productId and quantity required");
    const product = await prisma.product.findFirst({
      where: { id: productId, workspaceId: ctx.workspace.id },
    });
    if (!product) return badRequest("Product not found");
    const updated = await prisma.product.update({
      where: { id: productId },
      data: { stock: product.stock + Number(quantity) },
    });
    return Response.json(updated);
  }

  return badRequest("Unknown action. Use action: 'adjust'");
}
