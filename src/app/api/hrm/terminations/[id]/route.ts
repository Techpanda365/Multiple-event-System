import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/workspace";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    const { id } = await params;
    const body = await req.json();

    const result = await prisma.termination.updateMany({
      where: { id, workspaceId: workspace.id },
      data: {
        employeeId: body.employeeId,
        terminationType: body.terminationType,
        approvedBy: body.approvedBy,
        noticeDate: body.noticeDate ? new Date(body.noticeDate) : undefined,
        terminationDate: body.terminationDate ? new Date(body.terminationDate) : undefined,
        reason: body.reason,
        description: body.description,
        document: body.document,
        status: body.status,
      },
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating termination:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    const { id } = await params;
    await prisma.termination.deleteMany({ where: { id, workspaceId: workspace.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting termination:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
