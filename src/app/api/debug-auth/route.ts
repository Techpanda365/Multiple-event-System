import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// Temporary debug endpoint — DELETE after fixing
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session-token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No session-token cookie found" });
    }

    // Token verify karo
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: "Token verification failed — invalid or expired" });
    }

    // DB mein user check karo
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true, isActive: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in DB", tokenId: payload.id });
    }

    // Workspace membership check karo
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: user.id },
      include: { workspace: { select: { id: true, name: true, slug: true, isActive: true } } },
    });

    return NextResponse.json({
      status: "OK",
      tokenPayload: { id: payload.id, email: payload.email, role: payload.role },
      user,
      workspaceMemberships: memberships.map((m) => ({
        workspaceId: m.workspaceId,
        workspaceName: m.workspace.name,
        workspaceActive: m.workspace.isActive,
        memberRole: m.role,
        joinedAt: m.joinedAt,
      })),
      totalWorkspaces: memberships.length,
    });
  } catch (err: any) {
    return NextResponse.json({ error: "Exception", message: err?.message });
  }
}
