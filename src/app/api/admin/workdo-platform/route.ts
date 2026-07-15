import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const version = process.env.APP_VERSION || "1.0.0";
  const platformName = process.env.PLATFORM_NAME || "Dash SaaS";

  const data = {
    name: platformName,
    version,
    description: "Enterprise Resource Planning System",
    about: "Dash SaaS is a comprehensive enterprise resource planning platform designed to manage business operations efficiently.",
    marketplace: true,
    docs: "/docs",
    updates: true,
    license: "MIT",
    environment: process.env.NODE_ENV || "development",
    totalUsers: await prisma.user.count(),
    totalWorkspaces: await prisma.workspace.count(),
  };

  return success(data);
}
