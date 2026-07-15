import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getUserWorkspace } from "@/lib/workspace";

const modelMap: Record<string, any> = {
  branches: prisma.branch,
  departments: prisma.department,
  designations: prisma.designation,
  documentTypes: prisma.documentType,
  awardTypes: prisma.awardType,
  terminationTypes: prisma.terminationType,
  warningTypes: prisma.warningType,
  complaintTypes: prisma.complaintType,
  holidayTypes: prisma.holidayType,
  documentCategories: prisma.documentCategory,
  announcementCategories: prisma.announcementCategory,
  eventTypes: prisma.eventType,
  allowanceTypes: prisma.allowanceType,
  deductionTypes: prisma.deductionType,
  loanTypes: prisma.loanType,
  workingDays: prisma.workingDay,
  ipRestricts: prisma.ipRestrict,
};

const allowedTypes = Object.keys(modelMap);

export async function PUT(req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params;
    if (!allowedTypes.includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

    const body = await req.json();
    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.isActive !== undefined) data.isActive = body.isActive;
    if (body.isRequired !== undefined) data.isRequired = body.isRequired;
    if (body.branch !== undefined) data.branch = body.branch;
    if (body.branchId !== undefined) data.branchId = body.branchId;
    if (body.department !== undefined) data.department = body.department;
    if (body.departmentId !== undefined) data.departmentId = body.departmentId;
    if (body.day !== undefined) data.day = body.day;
    if (body.isWorking !== undefined) data.isWorking = body.isWorking;
    if (body.ip !== undefined) data.ip = body.ip;

    const result = await modelMap[type].updateMany({ where: { id, workspaceId: workspace.id }, data });
    if (result.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error updating ${type}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ type: string; id: string }> }) {
  try {
    const { type, id } = await params;
    if (!allowedTypes.includes(type)) return NextResponse.json({ error: "Invalid type" }, { status: 400 });

    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const workspace = await getUserWorkspace(session.user.id);
    if (!workspace) return NextResponse.json({ error: "No workspace found" }, { status: 404 });

    await modelMap[type].deleteMany({ where: { id, workspaceId: workspace.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${type}:`, error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
