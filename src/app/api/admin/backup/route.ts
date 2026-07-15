import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "backup_logs" } });
  const backups = setting ? JSON.parse(setting.value) : [];

  return success({ backups });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const setting = await prisma.setting.findUnique({ where: { key: "backup_logs" } });
  const backups = setting ? JSON.parse(setting.value) : [];

  const newBackup = {
    id: crypto.randomUUID(),
    name: body.name || `Backup_${new Date().toISOString().split("T")[0]}`,
    type: body.type || "Full",
    size: body.size || "0 MB",
    directories: body.directories || [],
    created_at: new Date().toISOString(),
    status: "Completed",
  };

  backups.unshift(newBackup);
  await prisma.setting.upsert({
    where: { key: "backup_logs" },
    update: { value: JSON.stringify(backups.slice(0, 50)) },
    create: { key: "backup_logs", value: JSON.stringify([newBackup]), group: "backup" },
  });

  return success({ backup: newBackup }, 201);
}
