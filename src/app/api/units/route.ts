import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const units = await prisma.unit.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });

  return Response.json(units);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name?.trim()) return badRequest("Unit name is required");

  const existing = await prisma.unit.findUnique({
    where: { workspaceId_name: { workspaceId: ctx.workspace.id, name: body.name.trim() } },
  });
  if (existing) return badRequest("Unit already exists");

  const unit = await prisma.unit.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name.trim(),
    },
  });

  return Response.json(unit, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
