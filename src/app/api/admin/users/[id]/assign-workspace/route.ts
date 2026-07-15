import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

// Super Admin — kisi user ko workspace assign karo ya nayi workspace banao
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const { id: userId } = await params;
  const body = await req.json();

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return badRequest("User not found");

  // Check — kya already workspace hai?
  const existingMembership = await prisma.workspaceMember.findFirst({
    where: { userId },
    include: { workspace: true },
  });

  if (existingMembership) {
    return success({
      message: `User already has workspace: "${existingMembership.workspace.name}"`,
      workspace: existingMembership.workspace,
      alreadyExists: true,
    });
  }

  // Existing workspaceId pass kiya gaya hai toh us mein add karo
  if (body.workspaceId) {
    const workspace = await prisma.workspace.findUnique({ where: { id: body.workspaceId } });
    if (!workspace) return badRequest("Workspace not found");

    await prisma.workspaceMember.create({
      data: { userId, workspaceId: workspace.id, role: body.role || "ADMIN" },
    });

    return success({ message: `User added to workspace "${workspace.name}"`, workspace });
  }

  // Nayi workspace create karo
  const wsName = user.companyName || user.name || user.email.split("@")[0];
  const slugBase = wsName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  let slug = slugBase;
  let attempt = 1;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${attempt++}`;
  }

  const workspace = await prisma.workspace.create({
    data: { name: wsName, slug, isActive: true },
  });

  await prisma.workspaceMember.create({
    data: { userId, workspaceId: workspace.id, role: "ADMIN" },
  });

  // User role ADMIN set karo
  await prisma.user.update({
    where: { id: userId },
    data: { role: "ADMIN" },
  });

  return success({
    message: `✅ Workspace "${workspace.name}" created and assigned to ${user.name || user.email}`,
    workspace,
  }, 201);
}
