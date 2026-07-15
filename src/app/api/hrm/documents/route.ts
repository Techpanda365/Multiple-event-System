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

    const documents = await prisma.document.findMany({
      where: { workspaceId: workspace.id },
      include: { employee: { select: { id: true, firstName: true, lastName: true, employeeId: true } } },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching documents:", error);
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
    const { title, name, documentCategory, effectiveDate, description, fileUrl, fileType, employeeId, uploadedBy } = body;

    if (!title && !name) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        workspaceId: workspace.id,
        name: name || title,
        title: title || name,
        description: description || null,
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        documentCategory: documentCategory || null,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        uploadedBy: uploadedBy || null,
        employeeId: employeeId || null,
        status: "Pending",
      },
    });

    return NextResponse.json({ success: true, data: document }, { status: 201 });
  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
