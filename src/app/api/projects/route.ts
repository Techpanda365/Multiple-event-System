import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const projects = await prisma.project.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status && status !== "ALL" ? { status: status as any } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    include: {
      _count: { select: { tasks: true, members: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(projects);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Project name is required");

  const project = await prisma.project.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      description: body.description || null,
      status: body.status || "PLANNING",
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      budget: body.budget != null ? Number(body.budget) : null,
      createdBy: ctx.user.id,
    },
  });

  return Response.json(project, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
