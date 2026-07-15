import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const contractors = await prisma.contractor.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });
  return Response.json(contractors);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  if (!body.name) return badRequest("Name is required");

  const contractor = await prisma.contractor.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      company: body.company || null,
      email: body.email || null,
      phone: body.phone || null,
      address: body.address || null,
      isActive: body.isActive !== false,
    },
  });
  return Response.json(contractor, { status: 201 });
}
