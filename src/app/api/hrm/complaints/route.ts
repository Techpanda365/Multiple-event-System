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

    const complaints = await prisma.complaint.findMany({
      where: { workspaceId: workspace.id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
        againstEmployee: { select: { id: true, firstName: true, lastName: true, employeeId: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
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
    const { employeeId, againstEmployeeId, complaintType, subject, complaintDate, description, document } = body;

    if (!employeeId || !againstEmployeeId || !complaintType || !subject || !complaintDate) {
      return NextResponse.json({ error: "Employee, against employee, complaint type, subject and complaint date are required" }, { status: 400 });
    }

    const complaint = await prisma.complaint.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        againstEmployeeId,
        complaintType,
        subject,
        complaintDate: new Date(complaintDate),
        description: description || null,
        document: document || null,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: complaint }, { status: 201 });
  } catch (error) {
    console.error("Error creating complaint:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
