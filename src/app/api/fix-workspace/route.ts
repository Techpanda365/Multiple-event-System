import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { prisma } from "@/lib/db";

// One-time fix API — company user ko workspace assign karta hai
// Usage: GET /api/fix-workspace (company user se logged in hokar)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session-token")?.value;
    if (!token) return NextResponse.json({ error: "Not logged in" }, { status: 401 });

    const payload = await verifyToken(token);
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Check — kya already workspace hai?
    const existing = await prisma.workspaceMember.findFirst({ where: { userId: user.id } });
    if (existing) {
      const ws = await prisma.workspace.findUnique({ where: { id: existing.workspaceId } });
      return NextResponse.json({
        message: "Workspace already exists",
        workspace: ws,
        role: existing.role,
      });
    }

    // Workspace name — companyName ya name se banao
    const wsName = user.companyName || user.name || user.email.split("@")[0];
    const slugBase = wsName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    // Unique slug ensure karo
    let slug = slugBase;
    let attempt = 1;
    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${slugBase}-${attempt++}`;
    }

    // Workspace create karo
    const workspace = await prisma.workspace.create({
      data: { name: wsName, slug, isActive: true },
    });

    // User ko ADMIN member banao
    await prisma.workspaceMember.create({
      data: { userId: user.id, workspaceId: workspace.id, role: "ADMIN" },
    });

    return NextResponse.json({
      message: `✅ Workspace "${workspace.name}" created and linked to your account!`,
      workspace,
      action: "Please logout and login again for changes to take effect.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Something went wrong" }, { status: 500 });
  }
}
