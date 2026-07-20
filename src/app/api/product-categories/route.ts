import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const categories = await prisma.productCategory.findMany({
    where: { workspaceId: ctx.workspace.id },
    orderBy: { name: "asc" },
  });

  return Response.json(categories);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name?.trim()) return badRequest("Category name is required");

  const existing = await prisma.productCategory.findUnique({
    where: { workspaceId_name: { workspaceId: ctx.workspace.id, name: body.name.trim() } },
  });
  if (existing) return badRequest("Category already exists");

  const category = await prisma.productCategory.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name.trim(),
      color: body.color || "#3b82f6",
    },
  });

  return Response.json(category, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
