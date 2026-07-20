import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signToken } from "@/lib/jwt";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: { id: true, name: true, email: true, role: true, phone: true, image: true, createdAt: true },
  });

  return success({ user });
}

export async function PATCH(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();

  const data: Record<string, unknown> = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.image !== undefined) data.image = body.image;

  if (body.currentPassword && body.newPassword) {
    const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
    if (!user?.passwordHash) return badRequest("Cannot change password");
    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) return badRequest("Current password is incorrect");
    data.passwordHash = await bcrypt.hash(body.newPassword, 10);
  }

  const user = await prisma.user.update({
    where: { id: ctx.user.id },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, image: true },
  });

  const newToken = await signToken(
    { id: user.id, email: user.email, name: user.name || "", role: user.role, phone: user.phone || "", image: user.image || "" }
  );

  const response = NextResponse.json({ user, message: "Profile updated successfully" });
  response.cookies.set("session-token", newToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
