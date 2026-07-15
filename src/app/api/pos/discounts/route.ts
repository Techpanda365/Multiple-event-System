import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const records = await prisma.posDiscount.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(records);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  if (!body.name?.trim()) return badRequest("Name is required");

  const record = await prisma.posDiscount.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name.trim(),
      applyOn: body.applyOn || "Product",
      discountType: body.discountType || "PERCENTAGE",
      value: Number(body.value) || 0,
      minimumQuantity: Number(body.minimumQuantity) || 1,
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      productIds: body.productIds || [],
      selectedCategory: body.selectedCategory || null,
      isActive: body.isActive !== false,
    },
  });
  return Response.json(record, { status: 201 });
}
