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

    const types = await prisma.leaveType.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(types);
  } catch (error) {
    console.error("Error fetching leave types:", error);
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
    const { name, daysAllowed, isPaid, color, carryForward, maxCarryForward } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const type = await prisma.leaveType.create({
      data: {
        workspaceId: workspace.id,
        name,
        daysAllowed: daysAllowed ? parseInt(daysAllowed) : 0,
        isPaid: isPaid === true,
        color: color || "#3b82f6",
        carryForward: carryForward === true,
        maxCarryForward: maxCarryForward ? parseInt(maxCarryForward) : 0,
      },
    });

    return NextResponse.json({ success: true, data: type }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Leave type with this name already exists" }, { status: 409 });
    }
    console.error("Error creating leave type:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
