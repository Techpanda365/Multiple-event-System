import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const shifts = await prisma.shift.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });
  return Response.json(shifts);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name || !body.startTime || !body.endTime) {
    return badRequest("name, startTime and endTime are required");
  }

  const shift = await prisma.shift.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      startTime: body.startTime,
      endTime: body.endTime,
      breakStart: body.breakStart || "",
      breakEnd: body.breakEnd || "",
      isNightShift: body.isNightShift === true,
    },
  });
  return Response.json(shift, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
