import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/workspace";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

    const body = await req.json();
    const { employeeId, leaveTypeId, startDate, endDate, reason, attachment } = body;

    if (!employeeId || !startDate || !endDate) {
      return NextResponse.json({ error: "Employee, start date and end date are required" }, { status: 400 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    const application = await prisma.leaveApplication.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        leaveTypeId: leaveTypeId || null,
        startDate: start,
        endDate: end,
        days,
        reason: reason || null,
        attachment: attachment || null,
      },
    });

    return NextResponse.json({ success: true, data: application }, { status: 201 });
  } catch (error) {
    console.error("Error creating leave application:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
