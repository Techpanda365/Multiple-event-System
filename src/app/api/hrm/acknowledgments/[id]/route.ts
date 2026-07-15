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

    const result = await prisma.acknowledgment.updateMany({
      where: { id, workspaceId: workspace.id },
      data: {
        documentTitle: body.documentTitle,
        assignedBy: body.assignedBy,
        assignedDate: body.assignedDate ? new Date(body.assignedDate) : undefined,
        acknowledgedDate: body.acknowledgedDate ? new Date(body.acknowledgedDate) : undefined,
        status: body.status,
        note: body.note,
      },
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating acknowledgment:", error);
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
    await prisma.acknowledgment.deleteMany({ where: { id, workspaceId: workspace.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting acknowledgment:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
