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

    const acknowledgments = await prisma.acknowledgment.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(acknowledgments);
  } catch (error) {
    console.error("Error fetching acknowledgments:", error);
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
    const { employeeId, documentTitle, assignedBy, assignedDate, acknowledgedDate, status, note } = body;

    if (!employeeId || !documentTitle || !assignedDate) {
      return NextResponse.json({ error: "Employee, document title, and assigned date are required" }, { status: 400 });
    }

    const acknowledgment = await prisma.acknowledgment.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        documentTitle,
        assignedBy: assignedBy || null,
        assignedDate: new Date(assignedDate),
        acknowledgedDate: acknowledgedDate ? new Date(acknowledgedDate) : null,
        status: status || "Pending",
        note: note || null,
      },
    });

    return NextResponse.json({ success: true, data: acknowledgment }, { status: 201 });
  } catch (error) {
    console.error("Error creating acknowledgment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
