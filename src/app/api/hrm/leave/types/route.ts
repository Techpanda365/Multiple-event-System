import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const types = await prisma.leaveType.findMany({
    where: { workspaceId: ctx.workspace.id, isActive: true },
    orderBy: { name: "asc" },
  });
  return Response.json(types);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const body = await req.json();
  if (!body.name) return badRequest("Name is required");

  const leaveType = await prisma.leaveType.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      daysAllowed: body.daysAllowed ? Number(body.daysAllowed) : 0,
      isPaid: body.isPaid !== false,
      carryForward: body.carryForward === true,
      maxCarryForward: body.maxCarryForward ? Number(body.maxCarryForward) : 0,
      color: body.color || "#6366f1",
      isActive: body.isActive !== false,
    },
  });
  return Response.json(leaveType, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
