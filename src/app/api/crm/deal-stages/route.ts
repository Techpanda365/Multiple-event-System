import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.crmDealStage.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { order: "asc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return badRequest("Name is required");
  const max = await prisma.crmDealStage.findFirst({ where: { workspaceId: ctx.workspace.id }, orderBy: { order: "desc" } });
  const item = await prisma.crmDealStage.create({ data: { workspaceId: ctx.workspace.id, name, pipeline: body.pipeline?.trim() || null, probability: Number(body.probability) || 0, order: (max?.order ?? -1) + 1 } });
  return Response.json(item, { status: 201 });
}
