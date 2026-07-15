import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/db";
import { checkRateLimit, resetRateLimit } from "@/lib/rate-limit";
import { ensureUserWorkspace } from "@/lib/ensure-workspace";

const SECRET = process.env.AUTH_SECRET || "super-secret-key";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Rate limit check
    const rl = await checkRateLimit(`login:${email.toLowerCase()}`);
    if (!rl.allowed) {
      return NextResponse.json(
        { error: `Too many failed attempts. Try again after ${rl.retryAfter?.toISOString()}` },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: "Account is deactivated" }, { status: 403 });
    }

    await resetRateLimit(`login:${email.toLowerCase()}`);

    // ✅ Auto workspace — agar nahi hai toh login pe hi bana do
    const workspace = await ensureUserWorkspace(user.id);

    const tokenPayload: Record<string, unknown> = {
      id: user.id,
      email: user.email,
      name: user.name || "",
      role: user.role,
      phone: user.phone || "",
      image: user.image || "",
    };

    if (workspace) {
      tokenPayload.workspaceId = workspace.id;
      tokenPayload.workspaceName = workspace.name;
      tokenPayload.workspaceSlug = workspace.slug;
    }

    const token = jwt.sign(tokenPayload, SECRET, { expiresIn: "30d" });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name || "",
        role: user.role,
        workspace: workspace ?? null,
      },
    });

    response.cookies.set("session-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
