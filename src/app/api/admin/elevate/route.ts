import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role === "SUPER_ADMIN") {
      return NextResponse.json({ message: "User is already SUPER_ADMIN", user: { email: user.email, role: user.role } });
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN" },
    });

    return NextResponse.json({
      success: true,
      message: `User ${email} elevated to SUPER_ADMIN`,
      user: { email: updated.email, name: updated.name, role: updated.role },
    });
  } catch (error) {
    console.error("Elevate error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
