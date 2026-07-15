import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/workspace";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

    const events = await prisma.event.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

    const body = await req.json();
    const { title, eventType, departments, startDate, endDate, startTime, endTime, location, color, description } = body;

    if (!title || !eventType || !startDate || !endDate || !startTime || !endTime) {
      return NextResponse.json({ error: "Title, event type, dates, and times are required" }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        workspaceId: workspace.id,
        title,
        eventType,
        departments: departments ? (Array.isArray(departments) ? departments.join(",") : departments) : null,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startTime,
        endTime,
        location: location || null,
        color: color || "#3b82f6",
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: event }, { status: 201 });
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
