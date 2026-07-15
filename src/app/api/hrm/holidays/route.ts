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

    const holidays = await prisma.holiday.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { startDate: "desc" },
    });

    return NextResponse.json(holidays);
  } catch (error) {
    console.error("Error fetching holidays:", error);
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
    const { name, startDate, endDate, holidayType, description, isPaid } = body;

    if (!name || !startDate || !endDate || !holidayType) {
      return NextResponse.json({ error: "Name, start date, end date and holiday type are required" }, { status: 400 });
    }

    const holiday = await prisma.holiday.create({
      data: {
        workspaceId: workspace.id,
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        holidayType,
        description: description || null,
        isPaid: isPaid === true,
      },
    });

    return NextResponse.json({ success: true, data: holiday }, { status: 201 });
  } catch (error) {
    console.error("Error creating holiday:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
