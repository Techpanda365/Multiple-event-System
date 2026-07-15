import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const tickets = await prisma.helpdeskTicket.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return success({ tickets });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { title, description, status, priority, categoryId, creatorName, creatorEmail } = body;

  if (!title) return badRequest("Title is required");

  const count = await prisma.helpdeskTicket.count();
  const ticketId = `TKT-${String(count + 1).padStart(4, "0")}`;

  const ticket = await prisma.helpdeskTicket.create({
    data: {
      ticketId,
      title,
      description,
      status: status || "OPEN",
      priority: priority || "MEDIUM",
      categoryId,
      creatorName: creatorName || "Anonymous",
      creatorEmail,
      replies: [],
    },
  });

  return success({ ticket }, 201);
}
