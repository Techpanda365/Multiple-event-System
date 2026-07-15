import { NextRequest } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { requireAuth, unauthorized, success } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
  // requireAuth — Super Admin aur Company User dono ke liye kaam karega
  const ctx = await requireAuth();
  if (!ctx) return unauthorized();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return new Response(JSON.stringify({ error: "No file provided" }), { status: 400 });

    // File size limit — 5MB
    if (file.size > 5 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File too large. Max 5MB allowed." }), { status: 400 });
    }

    // Sirf image files allow karo
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: "Only image files are allowed (jpg, png, gif, webp)" }), { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const filename = `${ctx.user.id}-${Date.now()}.${ext}`;
    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);

    return success({ url: `/uploads/avatars/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return new Response(JSON.stringify({ error: "Upload failed" }), { status: 500 });
  }
}
