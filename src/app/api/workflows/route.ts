import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const workflows = await prisma.workflow.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(workflows);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Workflow name is required");

  const workflow = await prisma.workflow.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      description: body.description || null,
      trigger: body.trigger || "manual",
      actions: body.actions || [],
      conditions: body.conditions || {},
      isActive: body.isActive !== false,
    },
  });

  return Response.json(workflow, { status: 201 });
}
