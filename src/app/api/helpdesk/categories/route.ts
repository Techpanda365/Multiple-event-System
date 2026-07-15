import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const categories = await prisma.helpdeskCategory.findMany({
    orderBy: { name: "asc" },
  });

  return Response.json(categories);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Category name is required");

  const category = await prisma.helpdeskCategory.create({
    data: { name: body.name, description: body.description || null, color: body.color || "#6366f1" },
  });

  return Response.json(category, { status: 201 });
}
