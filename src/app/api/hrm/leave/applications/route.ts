import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const status = req.nextUrl.searchParams.get("status");

  const applications = await prisma.leaveApplication.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(employeeId ? { employeeId } : {}),
      ...(status ? { status: status as any } : {}),
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      leaveType: { select: { id: true, name: true, color: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(applications);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.employeeId || !body.leaveTypeId || !body.startDate || !body.endDate) {
    return badRequest("employeeId, leaveTypeId, startDate and endDate are required");
  }

  const start = new Date(body.startDate);
  const end = new Date(body.endDate);
  const days = body.days != null
    ? Number(body.days)
    : Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  const application = await prisma.leaveApplication.create({
    data: {
      workspaceId: ctx.workspace.id,
      employeeId: body.employeeId,
      leaveTypeId: body.leaveTypeId,
      startDate: start,
      endDate: end,
      days,
      reason: body.reason || null,
      status: "PENDING",
    },
  });
  return Response.json(application, { status: 201 });
}
