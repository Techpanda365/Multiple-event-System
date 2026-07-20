import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest } from "@/lib/api-auth";
import { COOKIE_NAME } from "@/lib/admin-workspace";

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { workspaceId } = body;

  if (!workspaceId) {
    const response = NextResponse.json({ success: true, workspace: null });
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!workspace) return badRequest("Workspace not found");

  const response = NextResponse.json({ success: true, workspace });
  response.cookies.set(COOKIE_NAME, workspaceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });

  return response;
}
