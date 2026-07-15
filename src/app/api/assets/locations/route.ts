import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.location.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { createdAt: "asc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const name = body.name?.trim();
  const code = body.code?.trim();
  if (!name) return badRequest("Name is required");
  if (!code) return badRequest("Code is required");
  const item = await prisma.location.create({
    data: {
      workspaceId: ctx.workspace.id,
      name,
      code,
      type: body.type?.trim() || "Building",
      parentLocation: body.parentLocation?.trim() || null,
      address: body.address?.trim() || null,
      city: body.city?.trim() || null,
      state: body.state?.trim() || null,
      country: body.country?.trim() || null,
      postalCode: body.postalCode?.trim() || null,
      contactPerson: body.contactPerson?.trim() || null,
      contactPhone: body.contactPhone?.trim() || null,
      contactEmail: body.contactEmail?.trim() || null,
      description: body.description?.trim() || null,
      isActive: body.isActive !== undefined ? body.isActive : true,
    },
  });
  return Response.json(item, { status: 201 });
}
