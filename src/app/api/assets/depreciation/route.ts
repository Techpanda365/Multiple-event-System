import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.assetDepreciation.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { createdAt: "desc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const assetName = body.assetName?.trim();
  const usefulLife = parseInt(body.usefulLife, 10);
  const salvageValue = parseFloat(body.salvageValue) || 0;
  const startDate = body.startDate;

  if (!assetName) return badRequest("Asset is required");
  if (!usefulLife || usefulLife < 1) return badRequest("Valid useful life is required");
  if (!startDate) return badRequest("Start date is required");

  const item = await prisma.assetDepreciation.create({
    data: {
      workspaceId: ctx.workspace.id,
      assetId: body.assetId || null,
      assetName,
      method: body.method || "Straight Line",
      usefulLife,
      salvageValue,
      startDate: new Date(startDate),
      accumulated: parseFloat(body.accumulated) || 0,
      status: body.status || "Active",
      notes: body.notes?.trim() || null,
    },
  });
  return Response.json(item, { status: 201 });
}
