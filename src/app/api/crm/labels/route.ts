import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.crmLabel.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { createdAt: "asc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return badRequest("Name is required");
  const item = await prisma.crmLabel.create({ data: { workspaceId: ctx.workspace.id, name, pipeline: body.pipeline?.trim() || null, color: body.color?.trim() || "#6b7280" } });
  return Response.json(item, { status: 201 });
}
