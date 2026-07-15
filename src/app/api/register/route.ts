import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { ensureUserWorkspace } from "@/lib/ensure-workspace";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, companyName } = body;

    if (!fullName || !email || !password) {
      return NextResponse.json({ error: "Full name, email, and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Pehla registered user = SUPER_ADMIN, baaki sab = ADMIN
    const existingUserCount = await prisma.user.count();
    const role = existingUserCount === 0 ? "SUPER_ADMIN" : "ADMIN";

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: fullName,
        companyName: companyName || null,
        role,
        isActive: true,
      },
    });

    // ADMIN role ke liye workspace banao aur default data seed karo
    if (role === "ADMIN") {
      await ensureUserWorkspace(user.id);
    }

    return NextResponse.json({
      success: true,
      message: "Account created successfully. Please login.",
      user: { id: user.id, name: user.name, email: user.email, role },
    }, { status: 201 });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
