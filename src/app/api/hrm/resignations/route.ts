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

    const resignations = await prisma.resignation.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(resignations);
  } catch (error) {
    console.error("Error fetching resignations:", error);
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
    const { employeeId, lastWorkingDate, reason, description, document } = body;

    if (!employeeId || !lastWorkingDate) {
      return NextResponse.json({ error: "Employee and last working date are required" }, { status: 400 });
    }

    const resignation = await prisma.resignation.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        lastWorkingDate: new Date(lastWorkingDate),
        reason: reason || null,
        description: description || null,
        document: document || null,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: resignation }, { status: 201 });
  } catch (error) {
    console.error("Error creating resignation:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
