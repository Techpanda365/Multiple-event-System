import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const data = await prisma.assetAssignment.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(data);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  if (!body.assetName?.trim()) return badRequest("Asset name is required");
  if (!body.assignedTo?.trim()) return badRequest("Assigned to is required");

  const assignment = await prisma.assetAssignment.create({
    data: {
      workspaceId: ctx.workspace.id,
      assetId: body.assetId || null,
      assetName: body.assetName.trim(),
      assignedTo: body.assignedTo.trim(),
      assignedDate: body.assignedDate ? new Date(body.assignedDate) : new Date(),
      expectedReturn: body.expectedReturn ? new Date(body.expectedReturn) : null,
      status: body.status || "Active",
      condition: body.condition || "Excellent",
      notes: body.notes?.trim() || null,
    },
  });
  return Response.json(assignment, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
