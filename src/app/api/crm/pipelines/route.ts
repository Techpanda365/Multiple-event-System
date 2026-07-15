import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.crmPipeline.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { createdAt: "asc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return badRequest("Name is required");
  const item = await prisma.crmPipeline.create({ data: { workspaceId: ctx.workspace.id, name, description: body.description?.trim() || null } });
  return Response.json(item, { status: 201 });
}
