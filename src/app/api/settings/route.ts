import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const prefix = `workspace_${ctx.workspace.id}_`;
  const settings = await prisma.setting.findMany({
    where: { key: { startsWith: prefix } },
  });

  const result: Record<string, string> = {};
  settings.forEach((s) => {
    result[s.key.replace(prefix, "")] = s.value;
  });

  return Response.json(result);
}

export async function PUT(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const prefix = `workspace_${ctx.workspace.id}_`;

  for (const [key, value] of Object.entries(body)) {
    await prisma.setting.upsert({
      where: { key: prefix + key },
      create: { key: prefix + key, value: String(value), group: "workspace" },
      update: { value: String(value) },
    });
  }

  return Response.json({ success: true });
} catch (error) {
  console.error("PUT error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
