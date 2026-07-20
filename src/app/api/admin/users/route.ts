import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";
import { ensureUserWorkspace } from "@/lib/ensure-workspace";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      workspaceRoles: {
        include: { workspace: { select: { id: true, name: true, slug: true } } },
      },
    },
  });

  return success({ users });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { email, password, name, phone, companyName, isActive, role } = body;

  if (!email || !password) return badRequest("Email and password are required");
  if (password.length < 6) return badRequest("Password must be at least 6 characters");

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return badRequest("Email already exists");

  const passwordHash = await bcrypt.hash(password, 10);
  const assignedRole = role === "SUPER_ADMIN" ? "ADMIN" : (role || "ADMIN");

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: name || email.split("@")[0],
      phone: phone || null,
      companyName: companyName || null,
      role: assignedRole as any,
      isActive: isActive ?? true,
    },
  });

  // ✅ Automatically workspace create karo — koi manual step nahi
  const workspace = await ensureUserWorkspace(user.id);

  return success({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      companyName: user.companyName,
      role: user.role,
      isActive: user.isActive,
    },
    workspace,
    message: workspace
      ? `Company owner created. Workspace "${workspace.name}" automatically created.`
      : "User created successfully.",
  }, 201);
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
