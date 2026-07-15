import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized } from "@/lib/api-auth";

// Super Admin — sabke liye workspace fix karo jo ADMIN role ke hain
// GET /api/admin/fix-all-workspaces
export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  // Saare ADMIN users dhundo jinke paas koi workspace nahi
  const allAdminUsers = await prisma.user.findMany({
    where: { role: "ADMIN" },
  });

  const results = [];

  for (const user of allAdminUsers) {
    // Check karo kya workspace already hai
    const existing = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      include: { workspace: true },
    });

    if (existing) {
      results.push({
        user: user.email,
        status: "already_has_workspace",
        workspace: existing.workspace.name,
      });
      continue;
    }

    // Nayi workspace banao
    const wsName = user.companyName || user.name || user.email.split("@")[0];
    const slugBase = wsName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    let slug = slugBase;
    let attempt = 1;
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${attempt++}`;
    }

    const workspace = await prisma.workspace.create({
      data: { name: wsName, slug, isActive: true },
    });

    await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: "ADMIN" },
    });

    results.push({
      user: user.email,
      status: "workspace_created",
      workspace: workspace.name,
      slug: workspace.slug,
    });
  }

  // STAFF role users bhi check karo
  const staffWithNoWorkspace = await prisma.user.findMany({
    where: { role: "STAFF" },
  });

  for (const user of staffWithNoWorkspace) {
    const existing = await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
    });
    if (!existing) {
      results.push({
        user: user.email,
        status: "staff_no_workspace",
        note: "STAFF user has no workspace — assign manually",
      });
    }
  }

  return NextResponse.json({
    message: "Fix completed",
    totalProcessed: allAdminUsers.length,
    results,
  });
}
