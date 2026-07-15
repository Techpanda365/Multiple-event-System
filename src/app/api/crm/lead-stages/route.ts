import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.crmLeadStage.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { order: "asc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return badRequest("Name is required");
  const max = await prisma.crmLeadStage.findFirst({ where: { workspaceId: ctx.workspace.id }, orderBy: { order: "desc" } });
  const item = await prisma.crmLeadStage.create({ data: { workspaceId: ctx.workspace.id, name, color: body.color?.trim() || null, order: (max?.order ?? -1) + 1 } });
  return Response.json(item, { status: 201 });
}
