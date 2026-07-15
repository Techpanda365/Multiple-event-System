import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const categories = await prisma.helpdeskCategory.findMany({
    orderBy: { name: "asc" },
  });

  return success({ categories });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { name, description, color, isActive } = body;

  if (!name) return badRequest("Category name is required");

  const category = await prisma.helpdeskCategory.create({
    data: { name, description, color: color || "#6366f1", isActive: isActive ?? true },
  });

  return success({ category }, 201);
}
