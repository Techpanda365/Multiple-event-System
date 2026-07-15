import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const page = parseInt(searchParams.get("page") || "1");
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [logs, total] = await Promise.all([
    prisma.loginLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.loginLog.count({ where }),
  ]);

  return success({ logs, total, page, limit });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const log = await prisma.loginLog.create({
    data: {
      userId: body.userId,
      email: body.email,
      role: body.role,
      ip: body.ip,
      userAgent: body.userAgent,
      status: body.status || "SUCCESS",
    },
  });

  return success({ log }, 201);
}
