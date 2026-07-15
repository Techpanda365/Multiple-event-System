import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "file_shares" } });
  const shares = setting ? JSON.parse(setting.value) : [];

  return success({ shares });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const setting = await prisma.setting.findUnique({ where: { key: "file_shares" } });
  const shares = setting ? JSON.parse(setting.value) : [];

  const newShare = {
    id: crypto.randomUUID(),
    company: body.company,
    fileName: body.fileName,
    appliedDate: new Date().toISOString(),
    actionDate: body.actionDate || "",
    status: body.status || "Pending",
  };

  shares.push(newShare);
  await prisma.setting.upsert({
    where: { key: "file_shares" },
    update: { value: JSON.stringify(shares) },
    create: { key: "file_shares", value: JSON.stringify(shares), group: "file-share" },
  });

  return success({ share: newShare }, 201);
}

export async function PATCH(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { id, ...updates } = body;

  const setting = await prisma.setting.findUnique({ where: { key: "file_shares" } });
  const shares = setting ? JSON.parse(setting.value) : [];
  const index = shares.findIndex((s: Record<string, unknown>) => s.id === id);
  if (index === -1) return success({ error: "Share not found" }, 404);

  shares[index] = { ...shares[index], ...updates };
  await prisma.setting.upsert({
    where: { key: "file_shares" },
    update: { value: JSON.stringify(shares) },
    create: { key: "file_shares", value: JSON.stringify(shares), group: "file-share" },
  });

  return success({ share: shares[index] });
}
