import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "media_files" } });
  const files = setting ? JSON.parse(setting.value) : [];

  return success({ files });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const setting = await prisma.setting.findUnique({ where: { key: "media_files" } });
  const files = setting ? JSON.parse(setting.value) : [];

  const newFile = {
    id: crypto.randomUUID(),
    name: body.name,
    type: body.type || "file",
    fileType: body.fileType || "unknown",
    size: body.size || "0 KB",
    date: new Date().toISOString(),
    folder: body.folder || "",
  };

  files.push(newFile);
  await prisma.setting.upsert({
    where: { key: "media_files" },
    update: { value: JSON.stringify(files) },
    create: { key: "media_files", value: JSON.stringify(files), group: "media" },
  });

  return success({ file: newFile }, 201);
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}

export async function PATCH(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { id, ...updates } = body;

  const setting = await prisma.setting.findUnique({ where: { key: "media_files" } });
  const files = setting ? JSON.parse(setting.value) : [];
  const index = files.findIndex((f: Record<string, unknown>) => f.id === id);
  if (index === -1) return success({ error: "File not found" }, 404);

  files[index] = { ...files[index], ...updates };
  await prisma.setting.upsert({
    where: { key: "media_files" },
    update: { value: JSON.stringify(files) },
    create: { key: "media_files", value: JSON.stringify(files), group: "media" },
  });

  return success({ file: files[index] });
} catch (error) {
  console.error("PATCH error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
