import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { requireAuth, unauthorized, badRequest, success } from "@/lib/api-auth";

const SECRET = process.env.AUTH_SECRET;
if (!SECRET) throw new Error("AUTH_SECRET is not set");

export async function GET() {
  const ctx = await requireAuth();
  if (!ctx) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: ctx.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      image: true,
      companyName: true,
      createdAt: true,
    },
  });

  return success({ user });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAuth();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = body.name;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.image !== undefined) data.image = body.image;
  if (body.companyName !== undefined) data.companyName = body.companyName;

  // Password change
  if (body.currentPassword && body.newPassword) {
    if (body.newPassword.length < 6) return badRequest("New password must be at least 6 characters");
    const user = await prisma.user.findUnique({ where: { id: ctx.user.id } });
    if (!user?.passwordHash) return badRequest("Cannot change password");
    const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
    if (!valid) return badRequest("Current password is incorrect");
    data.passwordHash = await bcrypt.hash(body.newPassword, 10);
  }

  const user = await prisma.user.update({
    where: { id: ctx.user.id },
    data,
    select: { id: true, name: true, email: true, role: true, phone: true, image: true, companyName: true },
  });

  // Session token refresh karo taaki naam/image update ho
  const newToken = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role,
      phone: user.phone || "",
      image: user.image || "",
    },
    SECRET,
    { expiresIn: "30d" }
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
}
