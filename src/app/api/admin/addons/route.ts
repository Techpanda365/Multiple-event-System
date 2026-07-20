import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const addons = await prisma.addon.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { subscriptions: true } },
    },
  });

  return success({ addons });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { name, slug, description, price, isPremium, isActive, version } = body;

  if (!name || !slug) return badRequest("Name and slug are required");

  const slugExists = await prisma.addon.findUnique({ where: { slug } });
  if (slugExists) return badRequest("Slug already exists");

  const addon = await prisma.addon.create({
    data: { name, slug, description, price: price || 0, isPremium: isPremium ?? false, isActive: isActive ?? true, version: version || "1.0.0" },
  });

  return success({ addon }, 201);
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
