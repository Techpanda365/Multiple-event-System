import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/workspace";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    const { id } = await params;
    const type = await prisma.leaveType.findFirst({ where: { id, workspaceId: workspace.id } });
    if (!type) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(type);
  } catch (error) {
    console.error("Error fetching leave type:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });
    const { id } = await params;
    const body = await req.json();

    const result = await prisma.leaveType.updateMany({
      where: { id, workspaceId: workspace.id },
      data: {
        name: body.name,
        daysAllowed: body.daysAllowed != null ? parseInt(body.daysAllowed) : undefined,
        isPaid: body.isPaid,
        color: body.color,
        carryForward: body.carryForward,
        maxCarryForward: body.maxCarryForward != null ? parseInt(body.maxCarryForward) : undefined,
      },
    });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Leave type with this name already exists" }, { status: 409 });
    }
    console.error("Error updating leave type:", error);
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
    await prisma.leaveType.deleteMany({ where: { id, workspaceId: workspace.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting leave type:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
