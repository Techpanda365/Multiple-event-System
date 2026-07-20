import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const employeeId = req.nextUrl.searchParams.get("employeeId");

  const timesheets = await prisma.timesheet.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status ? { status } : {}),
      ...(employeeId ? { employeeId } : {}),
    },
    include: {
      _count: { select: { entries: true } },
      entries: { orderBy: { date: "asc" } },
    },
    orderBy: { weekStart: "desc" },
  });
  return Response.json(timesheets);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.weekStart || !body.weekEnd) return badRequest("weekStart and weekEnd are required");

  const timesheet = await prisma.timesheet.create({
    data: {
      workspaceId: ctx.workspace.id,
      employeeId: body.employeeId || null,
      userId: ctx.user.id,
      weekStart: new Date(body.weekStart),
      weekEnd: new Date(body.weekEnd),
      totalHours: 0,
      status: "DRAFT",
      notes: body.notes || null,
    },
  });
  return Response.json(timesheet, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
