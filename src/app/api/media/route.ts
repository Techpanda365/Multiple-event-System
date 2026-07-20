import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const folder = req.nextUrl.searchParams.get("folder");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const files = await prisma.mediaFile.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(folder && folder !== "ALL" ? { folder } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(files);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const folder = (formData.get("folder") as string) || "general";
  const alt = formData.get("alt") as string | null;

  if (!file) return badRequest("File is required");

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = file.name.split(".").pop() || "bin";
  const fileName = `${randomUUID()}.${ext}`;
  const uploadDir = join(process.cwd(), "public", "storage", "media");

  await mkdir(uploadDir, { recursive: true });
  await writeFile(join(uploadDir, fileName), buffer);

  const url = `/storage/media/${fileName}`;

  const mediaFile = await prisma.mediaFile.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: file.name,
      originalName: file.name,
      url,
      mimeType: file.type || "application/octet-stream",
      size: buffer.length,
      folder,
      alt,
    },
  });

  return Response.json(mediaFile, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
