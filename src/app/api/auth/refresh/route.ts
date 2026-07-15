import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, verifyToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 });
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token: refresh_token } });
    if (!stored) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    if (stored.expiresAt < new Date()) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      return NextResponse.json({ error: "Refresh token expired" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) {
      await prisma.refreshToken.delete({ where: { id: stored.id } });
      return NextResponse.json({ error: "User not found or inactive" }, { status: 401 });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role,
      phone: user.phone || "",
      image: user.image || "",
    };

    const newAccessToken = await signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      token: newAccessToken,
      user: {
        id: user.id,
        name: user.name || "",
        email: user.email,
        role: user.role,
      },
    });

    response.cookies.set("session-token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 15 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
