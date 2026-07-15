import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/workspace";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

    const runs = await prisma.payrollRun.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { payslips: true } } },
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error("Error fetching payroll runs:", error);
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
    const { title, frequency, month, year, payPeriodStart, payPeriodEnd, payDate, bankAccountId, notes } = body;

    if (!month || !year) {
      return NextResponse.json({ error: "Month and year are required" }, { status: 400 });
    }

    const run = await prisma.payrollRun.create({
      data: {
        workspaceId: workspace.id,
        title,
        frequency: frequency || "Monthly",
        month: parseInt(month),
        year: parseInt(year),
        payPeriodStart: payPeriodStart ? new Date(payPeriodStart) : null,
        payPeriodEnd: payPeriodEnd ? new Date(payPeriodEnd) : null,
        payDate: payDate ? new Date(payDate) : null,
        bankAccountId,
        notes,
      },
    });

    return NextResponse.json({ success: true, data: run }, { status: 201 });
  } catch (error) {
    console.error("Error creating payroll run:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
