import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const departments = await prisma.department.findMany({
    where: { workspaceId: ctx.workspace.id },
    include: { _count: { select: { employees: true } } },
    orderBy: { name: "asc" },
  });

  return Response.json(departments);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Department name is required");

  const department = await prisma.department.create({
    data: { workspaceId: ctx.workspace.id, name: body.name, description: body.description || null },
  });

  return Response.json(department, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
