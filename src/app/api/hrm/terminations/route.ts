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

    const terminations = await prisma.termination.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(terminations);
  } catch (error) {
    console.error("Error fetching terminations:", error);
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
    const { employeeId, terminationType, approvedBy, noticeDate, terminationDate, reason, description, document } = body;

    if (!employeeId || !terminationType || !noticeDate || !terminationDate) {
      return NextResponse.json({ error: "Employee, termination type, notice date and termination date are required" }, { status: 400 });
    }

    const termination = await prisma.termination.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        terminationType,
        approvedBy: approvedBy || null,
        noticeDate: new Date(noticeDate),
        terminationDate: new Date(terminationDate),
        reason: reason || null,
        description: description || null,
        document: document || null,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: termination }, { status: 201 });
  } catch (error) {
    console.error("Error creating termination:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
