import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim();

  const users = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(search ? { user: { OR: [{ name: { contains: search } }, { email: { contains: search } }] } } : {}),
    },
    include: { user: { select: { id: true, name: true, email: true, phone: true, image: true, isActive: true, role: true } } },
    orderBy: { joinedAt: "desc" },
  });

  return Response.json(users.map((wm) => ({ ...wm.user, workspaceRole: wm.role, joinedAt: wm.joinedAt })));
}

export async function POST(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.email) return badRequest("Email is required");
  if (!body.password) return badRequest("Password is required");

  let user = await prisma.user.findUnique({ where: { email: body.email } });
  if (!user) {
    const bcrypt = await import("bcryptjs");
    user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name || body.email.split("@")[0],
        passwordHash: await bcrypt.hash(body.password, 10),
        phone: body.phone || null,
        isActive: body.isActive !== false,
        role: (body.role as any) || "STAFF",
      },
    });
  }

  const existing = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId: ctx.workspace.id } },
  });
  if (existing) return badRequest("User is already in this workspace");

  const dbRole = body.role || "STAFF";
  await prisma.workspaceMember.create({
    data: { userId: user.id, workspaceId: ctx.workspace.id, role: dbRole as any },
  });

  return Response.json({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: dbRole,
    isActive: user.isActive,
  }, { status: 201 });
}
