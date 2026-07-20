import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, notFound, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const ts = await prisma.timesheet.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { entries: { orderBy: { date: "asc" } } },
  });
  if (!ts) return notFound();
  return Response.json(ts);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.timesheet.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound();

  if (Array.isArray(body.entries)) {
    await prisma.timesheetEntry.deleteMany({ where: { timesheetId: id } });
    const totalHours = body.entries.reduce((s: number, e: any) => s + Number(e.hours || 0), 0);
    for (const e of body.entries) {
      await prisma.timesheetEntry.create({
        data: {
          timesheetId: id,
          employeeId: existing.employeeId || null,
          projectId: e.projectId || null,
          taskId: e.taskId || null,
          date: new Date(e.date),
          hours: Number(e.hours),
          description: e.description || null,
          isBillable: e.isBillable !== false,
        },
      });
    }
    await prisma.timesheet.update({ where: { id }, data: { totalHours, status: body.status || existing.status, notes: body.notes } });
    return Response.json({ success: true });
  }

  await prisma.timesheet.updateMany({
    where: { id, workspaceId: ctx.workspace.id },
    data: { status: body.status, notes: body.notes },
  });
  return Response.json({ success: true });
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.timesheet.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound();
  if (existing.status === "APPROVED") return badRequest("Cannot delete an approved timesheet");
  await prisma.timesheet.delete({ where: { id } });
  return Response.json({ success: true });
} catch (error) {
  console.error("DELETE error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
