import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdminSession, unauthorized, badRequest, success } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const plans = await prisma.subscriptionPlan.findMany({
    orderBy: { price: "asc" },
  });

  return success({ plans });
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAdminSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const { name, description, price, interval, trialDays, features } = body;

  if (!name || price === undefined) return badRequest("name and price are required");

  const plan = await prisma.subscriptionPlan.create({
    data: {
      name,
      description,
      price,
      interval: interval || "MONTHLY",
      trialDays: trialDays ?? 0,
      features: features || [],
      isActive: true,
    },
  });

  return success({ plan }, 201);
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
