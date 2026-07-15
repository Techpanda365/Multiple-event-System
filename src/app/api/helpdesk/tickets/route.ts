import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const tickets = await prisma.helpdeskTicket.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status.toUpperCase() } : {}),
      ...(search ? { OR: [{ title: { contains: search } }, { ticketId: { contains: search } }, { creatorName: { contains: search } }] } : {}),
    },

    orderBy: { createdAt: "desc" },
  });

  return Response.json(tickets);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.title) return badRequest("Title is required");

  const count = await prisma.helpdeskTicket.count();
  const ticketId = `TK-${String(count + 1).padStart(4, "0")}`;

  const ticket = await prisma.helpdeskTicket.create({
    data: {
      ticketId,
      title: body.title,
      description: body.description || null,
      status: body.status?.toUpperCase() || "OPEN",
      priority: body.priority?.toUpperCase() || "MEDIUM",
      categoryId: body.categoryId || null,
      creatorName: body.creatorName || ctx.user.name || ctx.user.email,
      creatorEmail: body.creatorEmail || ctx.user.email,
    },
  });

  return Response.json(ticket, { status: 201 });
}
