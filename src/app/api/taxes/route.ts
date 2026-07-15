import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const taxes = await prisma.tax.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });

  return Response.json(taxes);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name?.trim()) return badRequest("Tax name is required");
  if (body.rate == null) return badRequest("Tax rate is required");

  const existing = await prisma.tax.findUnique({
    where: { workspaceId_name: { workspaceId: ctx.workspace.id, name: body.name.trim() } },
  });
  if (existing) return badRequest("Tax already exists");

  const tax = await prisma.tax.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name.trim(),
      rate: Number(body.rate),
      isActive: body.isActive !== false,
    },
  });

  return Response.json(tax, { status: 201 });
}
