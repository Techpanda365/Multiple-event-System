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

    const policies = await prisma.companyPolicy.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(policies);
  } catch (error) {
    console.error("Error fetching company policies:", error);
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
    const { title, branch, description, fileUrl, fileName, status } = body;

    if (!title || !branch) {
      return NextResponse.json({ error: "Title and branch are required" }, { status: 400 });
    }

    const policy = await prisma.companyPolicy.create({
      data: {
        workspaceId: workspace.id,
        title,
        branch,
        description: description || null,
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        status: status || "Draft",
      },
    });

    return NextResponse.json({ success: true, data: policy }, { status: 201 });
  } catch (error) {
    console.error("Error creating company policy:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
