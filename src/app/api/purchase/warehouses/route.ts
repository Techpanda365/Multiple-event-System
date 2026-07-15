import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const warehouses = await prisma.warehouse.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "asc" },
  });

  return Response.json(warehouses);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Warehouse name is required");

  const warehouse = await prisma.warehouse.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      code: body.code || "",
      phone: body.phone || "",
      email: body.email || "",
      country: body.country || "",
      city: body.city || "",
      address: body.address || "",
      zipCode: body.zipCode || "",
      isActive: body.status === "Active",
    },
  });

  return Response.json(warehouse, { status: 201 });
}
