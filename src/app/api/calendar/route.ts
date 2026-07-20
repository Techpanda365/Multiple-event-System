import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const startDate = req.nextUrl.searchParams.get("startDate");
  const endDate = req.nextUrl.searchParams.get("endDate");

  const where: Record<string, unknown> = { workspaceId: ctx.workspace.id };
  if (startDate) where.startDate = { gte: new Date(startDate) };
  if (endDate) {
    where.OR = [{ endDate: { lte: new Date(endDate) } }, { endDate: null }];
  }

  const events = await prisma.calendarEvent.findMany({
    where,
    orderBy: { startDate: "asc" },
  });

  return Response.json(events);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.title || !body.startDate) return badRequest("Title and start date are required");

  const event = await prisma.calendarEvent.create({
    data: {
      workspaceId: ctx.workspace.id,
      title: body.title,
      description: body.description || null,
      startDate: new Date(body.startDate),
      endDate: body.endDate ? new Date(body.endDate) : null,
      allDay: body.allDay || false,
      color: body.color || "#3b82f6",
      location: body.location || null,
      createdBy: ctx.user.id,
    },
  });

  return Response.json(event, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
