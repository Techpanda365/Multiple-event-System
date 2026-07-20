import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAuth, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAuth();
  if (!ctx) return unauthorized();

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: ctx.user.id },
    include: { workspace: true },
    orderBy: { joinedAt: "asc" },
  });

  return Response.json(memberships.map((m) => ({ ...m.workspace, role: m.role })));
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAuth();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Workspace name is required");

  const slugBase = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let slug = slugBase;
  let attempt = 1;
  while (await prisma.workspace.findUnique({ where: { slug } })) {
    slug = `${slugBase}-${attempt++}`;
  }

  const workspace = await prisma.workspace.create({
    data: {
      name: body.name,
      slug,
      description: body.description || null,
      isActive: true,
    },
  });

  await prisma.workspaceMember.create({
    data: {
      userId: ctx.user.id,
      workspaceId: workspace.id,
      role: "ADMIN",
    },
  });

  return Response.json(workspace, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
