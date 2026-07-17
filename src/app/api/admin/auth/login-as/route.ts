import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, signRefreshToken } from "@/lib/jwt";
import { requireAdminSession } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
  try {
    const ctx = await requireAdminSession();
    if (!ctx) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const tokenPayload = {
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name || "",
      role: targetUser.role,
      phone: targetUser.phone || "",
      image: targetUser.image || "",
    };

    const accessToken = await signToken(tokenPayload);
    const refreshToken = await signRefreshToken({ id: targetUser.id, email: targetUser.email });

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: targetUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name || "",
        email: targetUser.email,
        role: targetUser.role,
      },
    });

    response.cookies.set("session-token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login-as error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
