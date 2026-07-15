import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await prisma.user.findUnique({ where: { email: "company@example.com" } });
    if (!user) return NextResponse.json({ error: "user not found", emails: (await prisma.user.findMany()).map(u => u.email) });
    const valid = await bcrypt.compare("1234", user.passwordHash || "");
    return NextResponse.json({
      found: true,
      email: user.email,
      role: user.role,
      hasHash: !!user.passwordHash,
      isActive: user.isActive,
      passwordValid: valid,
    });
  } catch (e: unknown) {
    return NextResponse.json({ error: String(e) });
  }
}
