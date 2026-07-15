import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const app = await prisma.leaveApplication.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { employee: true, leaveType: true },
  });
  if (!app) return notFound();
  return Response.json(app);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const result = await prisma.leaveApplication.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: {
      status: body.status,
      approvedBy: body.approvedBy || ctx.user.id,
      approvedAt: body.status === "APPROVED" ? new Date() : undefined,
      rejectedReason: body.rejectedReason || null,
    },
  });
  if (result.count === 0) return notFound();

  // Balance update when approved
  if (body.status === "APPROVED") {
    const application = await prisma.leaveApplication.findUnique({ where: { id } });
    if (application) {
      const year = new Date(application.startDate).getFullYear();
      await prisma.leaveBalance.upsert({
        where: { employeeId_leaveTypeId_year: { employeeId: application.employeeId, leaveTypeId: application.leaveTypeId, year } },
        update: { used: { increment: application.days }, remaining: { decrement: application.days } },
        create: {
          workspaceId: ctx.workspace.id,
          employeeId: application.employeeId,
          leaveTypeId: application.leaveTypeId,
          year,
          allocated: 0,
          used: application.days,
          remaining: -application.days,
        },
      });
    }
  }
  return Response.json({ success: true });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  await prisma.leaveApplication.deleteMany({ where: { id, workspaceId: ctx.workspace.id } });
  return Response.json({ success: true });
}
