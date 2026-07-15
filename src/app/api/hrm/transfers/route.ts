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

    const transfers = await prisma.transfer.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transfers);
  } catch (error) {
    console.error("Error fetching transfers:", error);
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
    const { employeeId, effectiveDate, fromBranch, fromDepartment, fromDesignation, toBranch, toDepartment, toDesignation, reason, document } = body;

    if (!employeeId || !effectiveDate) {
      return NextResponse.json({ error: "Employee and effective date are required" }, { status: 400 });
    }

    const transfer = await prisma.transfer.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        effectiveDate: new Date(effectiveDate),
        fromBranch: fromBranch || null,
        fromDepartment: fromDepartment || null,
        fromDesignation: fromDesignation || null,
        toBranch: toBranch || null,
        toDepartment: toDepartment || null,
        toDesignation: toDesignation || null,
        reason: reason || null,
        document: document || null,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: transfer }, { status: 201 });
  } catch (error) {
    console.error("Error creating transfer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
