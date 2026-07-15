import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized, notFound, badRequest } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const project = await prisma.project.findFirst({
    where: { id, workspaceId: ctx.workspace.id },
    include: { tasks: true, members: true },
  });
  if (!project) return notFound("Project not found");
  return Response.json(project);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const body = await req.json();
  const existing = await prisma.project.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Project not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.status !== undefined) data.status = body.status;
  if (body.startDate !== undefined) data.startDate = new Date(body.startDate);
  if (body.endDate !== undefined) data.endDate = new Date(body.endDate);
  if (body.budget !== undefined) data.budget = Number(body.budget);

  const project = await prisma.project.update({ where: { id }, data });
  return Response.json(project);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.project.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Project not found");
  await prisma.project.delete({ where: { id } });
  return Response.json({ success: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();
  const { id } = await params;
  const existing = await prisma.project.findFirst({ where: { id, workspaceId: ctx.workspace.id } });
  if (!existing) return notFound("Project not found");

  const body = await req.json();
  if (body.action === "add-member") {
    if (!body.userId) return badRequest("userId required");
    await prisma.projectMember.create({
      data: { projectId: id, userId: body.userId, role: body.role || "member" },
    });
  } else if (body.action === "add-task") {
    if (!body.title) return badRequest("Task title required");
    await prisma.projectTask.create({
      data: {
        projectId: id, title: body.title, description: body.description || null,
        priority: body.priority || "medium", assignedTo: body.assignedTo || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
      },
    });
  }

  return Response.json({ success: true });
}
