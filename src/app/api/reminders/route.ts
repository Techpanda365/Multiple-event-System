import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const priority = req.nextUrl.searchParams.get("priority");

  const reminders = await prisma.reminder.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status && status !== "ALL" ? { status } : {}),
      ...(priority && priority !== "ALL" ? { priority } : {}),
    },
    orderBy: { dueDate: "asc" },
  });

  return Response.json(reminders);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.title || !body.dueDate) return badRequest("Title and due date are required");

  const reminder = await prisma.reminder.create({
    data: {
      workspaceId: ctx.workspace.id,
      title: body.title,
      description: body.description || null,
      dueDate: new Date(body.dueDate),
      priority: body.priority || "medium",
      status: body.status || "pending",
      assignedTo: body.assignedTo || null,
      createdBy: ctx.user.id,
    },
  });

  return Response.json(reminder, { status: 201 });
}
