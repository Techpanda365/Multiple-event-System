import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const setting = await prisma.setting.findUnique({ where: { key: "cms_subscribers" } });
  const subscribers = setting ? JSON.parse(setting.value) : [];

  return success({ subscribers });
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const setting = await prisma.setting.findUnique({ where: { key: "cms_subscribers" } });
  const subscribers = setting ? JSON.parse(setting.value) : [];

  const newSub = {
    id: crypto.randomUUID(),
    email: body.email,
    ip: body.ip || "",
    date: new Date().toISOString(),
    status: body.status || "Active",
  };

  subscribers.push(newSub);
  await prisma.setting.upsert({
    where: { key: "cms_subscribers" },
    update: { value: JSON.stringify(subscribers) },
    create: { key: "cms_subscribers", value: JSON.stringify(subscribers), group: "cms" },
  });

  return success({ subscriber: newSub }, 201);
}
