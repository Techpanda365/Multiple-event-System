import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.assetMaintenance.findMany({ where: { workspaceId: ctx.workspace.id }, orderBy: { createdAt: "desc" } });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  const title = body.title?.trim();
  const scheduledDate = body.scheduledDate;
  if (!title) return badRequest("Title is required");
  if (!scheduledDate) return badRequest("Scheduled date is required");

  const item = await prisma.assetMaintenance.create({
    data: {
      workspaceId: ctx.workspace.id,
      assetId: body.assetId || null,
      assetName: body.assetName || "",
      type: body.type || "Preventive",
      title,
      description: body.description?.trim() || null,
      scheduledDate: new Date(scheduledDate),
      completedDate: body.completedDate ? new Date(body.completedDate) : null,
      cost: body.cost ? parseFloat(body.cost) : null,
      technician: body.technician?.trim() || null,
      status: body.status || "Scheduled",
      priority: body.priority || "Medium",
      nextMaintenance: body.nextMaintenance ? new Date(body.nextMaintenance) : null,
      notes: body.notes?.trim() || null,
    },
  });
  return Response.json(item, { status: 201 });
}
