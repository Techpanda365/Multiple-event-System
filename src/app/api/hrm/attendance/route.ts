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

    const records = await prisma.attendance.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { firstName: true, lastName: true, employeeId: true } } },
      orderBy: { date: "desc" },
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching attendance:", error);
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
    const { employeeId, date, clockIn, clockOut, notes } = body;

    if (!employeeId || !date) {
      return NextResponse.json({ error: "Employee and date are required" }, { status: 400 });
    }

    const record = await prisma.attendance.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        date: new Date(date),
        checkIn: clockIn ? new Date(`${date}T${clockIn}`) : null,
        checkOut: clockOut ? new Date(`${date}T${clockOut}`) : null,
        note: notes || null,
      },
    });

    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Attendance already exists for this employee on this date" }, { status: 409 });
    }
    console.error("Error creating attendance:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
