import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const vendors = await prisma.vendor.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });

  return Response.json(vendors);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Vendor name is required");

  const vendor = await prisma.vendor.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      city: body.city || null,
      country: body.country || null,
      paymentTerms: body.paymentTerms || null,
      taxId: body.taxId || null,
      isActive: body.isActive !== false,
    },
  });

  return Response.json(vendor, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
