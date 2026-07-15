import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const employeeId = req.nextUrl.searchParams.get("employeeId");
  const year = Number(req.nextUrl.searchParams.get("year") || new Date().getFullYear());

  const balances = await prisma.leaveBalance.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      year,
      ...(employeeId ? { employeeId } : {}),
    },
    include: {
      employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      leaveType: { select: { id: true, name: true, color: true, daysAllowed: true } },
    },
  });
  return Response.json(balances);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.employeeId || !body.leaveTypeId || !body.year) {
    return badRequest("employeeId, leaveTypeId and year are required");
  }

  const year = Number(body.year);
  const allocated = Number(body.allocated) || 0;

  const balance = await prisma.leaveBalance.upsert({
    where: { employeeId_leaveTypeId_year: { employeeId: body.employeeId, leaveTypeId: body.leaveTypeId, year } },
    update: { allocated, remaining: allocated - (body.used ? Number(body.used) : 0) },
    create: {
      workspaceId: ctx.workspace.id,
      employeeId: body.employeeId,
      leaveTypeId: body.leaveTypeId,
      year,
      allocated,
      used: 0,
      remaining: allocated,
    },
  });
  return Response.json(balance, { status: 201 });
}
