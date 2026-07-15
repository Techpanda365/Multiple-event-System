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

    const promotions = await prisma.promotion.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promotions);
  } catch (error) {
    console.error("Error fetching promotions:", error);
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
    const { employeeId, previousBranch, previousDepartment, previousDesignation, currentBranch, currentDepartment, currentDesignation, effectiveDate, reason, document } = body;

    if (!employeeId || !effectiveDate) {
      return NextResponse.json({ error: "Employee and effective date are required" }, { status: 400 });
    }

    const promotion = await prisma.promotion.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        previousBranch: previousBranch || null,
        previousDepartment: previousDepartment || null,
        previousDesignation: previousDesignation || null,
        currentBranch: currentBranch || null,
        currentDepartment: currentDepartment || null,
        currentDesignation: currentDesignation || null,
        effectiveDate: new Date(effectiveDate),
        reason: reason || null,
        document: document || null,
      },
    });

    return NextResponse.json({ success: true, data: promotion }, { status: 201 });
  } catch (error) {
    console.error("Error creating promotion:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
