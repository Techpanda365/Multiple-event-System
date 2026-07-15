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

    const awards = await prisma.award.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(awards);
  } catch (error) {
    console.error("Error fetching awards:", error);
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
    const { employeeId, awardType, awardDate, description, certificate } = body;

    if (!employeeId || !awardType || !awardDate) {
      return NextResponse.json({ error: "Employee, award type and award date are required" }, { status: 400 });
    }

    const award = await prisma.award.create({
      data: {
        workspaceId: workspace.id,
        employeeId,
        awardType,
        awardDate: new Date(awardDate),
        description: description || null,
        certificate: certificate || null,
      },
    });

    return NextResponse.json({ success: true, data: award }, { status: 201 });
  } catch (error) {
    console.error("Error creating award:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
