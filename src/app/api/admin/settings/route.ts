import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const settings = await prisma.setting.findMany();
  const grouped: Record<string, Record<string, string>> = {};

  for (const s of settings) {
    if (!grouped[s.group]) grouped[s.group] = {};
    try { grouped[s.group][s.key] = JSON.parse(s.value); }
    catch { grouped[s.group][s.key] = s.value; }
  }

  return success({ settings: grouped });
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { key, value, group } = body;

  if (!key) return badRequest("Key is required");

  const stringValue = typeof value === "object" ? JSON.stringify(value) : String(value ?? "");

  const setting = await prisma.setting.upsert({
    where: { key },
    update: { value: stringValue, group: group || "general" },
    create: { key, value: stringValue, group: group || "general" },
  });

  return success({ setting, message: "Setting saved" });
}
