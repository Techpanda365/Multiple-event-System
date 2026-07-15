import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, notFound, success } from "@/lib/api-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({
    where: { id },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
      _count: { select: { members: true, projects: true, invoices: true, expenses: true, products: true } },
    },
  });
  if (!workspace) return notFound("Workspace not found");

  return success({ workspace });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.workspace.findUnique({ where: { id } });
  if (!existing) return notFound("Workspace not found");

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.slug !== undefined) {
    const slugExists = await prisma.workspace.findFirst({ where: { slug: body.slug, NOT: { id } } });
    if (slugExists) return badRequest("Slug already in use");
    data.slug = body.slug;
  }
  if (body.description !== undefined) data.description = body.description;
  if (body.isActive !== undefined) data.isActive = body.isActive;

  const workspace = await prisma.workspace.update({ where: { id }, data });

  if (body.addMemberIds?.length > 0) {
    const validUsers = await prisma.user.findMany({
      where: { id: { in: body.addMemberIds } },
      select: { id: true, role: true },
    });
    for (const u of validUsers) {
      const existingMember = await prisma.workspaceMember.findFirst({
        where: { userId: u.id, workspaceId: id },
      });
      if (!existingMember) {
        await prisma.workspaceMember.create({
          data: { userId: u.id, workspaceId: id, role: u.role || "STAFF" },
        });
      }
    }
  }

  return success({ workspace });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id } = await params;
  const existing = await prisma.workspace.findUnique({ where: { id } });
  if (!existing) return notFound("Workspace not found");

  await prisma.workspace.delete({ where: { id } });

  return success({ success: true });
}
