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

    const warnings = await prisma.warning.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(warnings);
  } catch (error) {
    console.error("Error fetching warnings:", error);
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
    const { employeeId, warningBy, warningType, subject, severity, warningDate, description, document } = body;

    if (!employeeId || !warningType || !subject || !warningDate) {
      return NextResponse.json({ error: "Employee, warning type, subject and warning date are required" }, { status: 400 });
    }

    const warning = await prisma.warning.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        warningBy: warningBy || null,
        warningType,
        subject,
        severity: severity || "Minor",
        warningDate: new Date(warningDate),
        description: description || null,
        document: document || null,
        status: "Active",
      },
    });

    return NextResponse.json({ success: true, data: warning }, { status: 201 });
  } catch (error) {
    console.error("Error creating warning:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
