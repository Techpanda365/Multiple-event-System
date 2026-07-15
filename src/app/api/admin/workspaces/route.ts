import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET() {
  try {
    const ctx = await requireAdminSession();
    if (!ctx) return unauthorized();

    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        _count: { select: { members: true, projects: true, invoices: true } },
      },
    });

    return success({ workspaces });
  } catch (error) {
    console.error("GET workspaces error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { name, slug, description, memberIds } = body;

  if (!name) return badRequest("Workspace name is required");

  const finalSlug = slug || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const slugExists = await prisma.workspace.findUnique({ where: { slug: finalSlug } });
  if (slugExists) return badRequest("Slug already exists, try a different name");

  const workspace = await prisma.workspace.create({
    data: { name, slug: finalSlug, description, isActive: true },
  });

  if (memberIds?.length > 0) {
    const validUsers = await prisma.user.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, role: true },
    });
    await prisma.workspaceMember.createMany({
      data: validUsers.map((u) => ({
        userId: u.id,
        workspaceId: workspace.id,
        role: u.role || "STAFF",
      })),
      skipDuplicates: true,
    });
  }

  return success({ workspace }, 201);
}
