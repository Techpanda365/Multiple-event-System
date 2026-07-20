import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const category = req.nextUrl.searchParams.get("category");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const assets = await prisma.asset.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status && status !== "ALL" ? { status } : {}),
      ...(category && category !== "ALL" ? { category } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(assets);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Asset name is required");

  const asset = await prisma.asset.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      description: body.description || null,
      category: body.category || "general",
      serialNumber: body.serialNumber || null,
      purchaseDate: body.purchaseDate ? new Date(body.purchaseDate) : null,
      supportedDate: body.supportedDate ? new Date(body.supportedDate) : null,
      quantity: body.quantity != null ? Number(body.quantity) : 1,
      unitPrice: body.unitPrice != null ? Number(body.unitPrice) : null,
      warrantyPeriod: body.warrantyPeriod || null,
      image: body.image || null,
      purchasePrice: body.purchasePrice != null ? Number(body.purchasePrice) : null,
      currentValue: body.currentValue != null ? Number(body.currentValue) : null,
      location: body.location || null,
      status: body.status || "active",
      assignedTo: body.assignedTo || null,
      notes: body.notes || null,
    },
  });

  return Response.json(asset, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
