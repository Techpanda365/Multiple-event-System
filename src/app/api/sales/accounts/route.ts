import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim();

  const accounts = await prisma.salesAccount.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(accounts);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("Account name is required");

  const account = await prisma.salesAccount.create({
    data: {
      workspaceId: ctx.workspace.id,
      name: body.name,
      email: body.email || null,
      phone: body.phone || null,
      website: body.website || null,
      accountType: body.accountType || null,
      industry: body.industry || null,
      assignedTo: body.assignedTo || null,
      document: body.document || null,
      address: body.address || null,
      city: body.city || null,
      billingState: body.billingState || null,
      country: body.country || null,
      billingPostalCode: body.billingPostalCode || null,
      shippingSameAsBilling: body.shippingSameAsBilling ?? false,
      shippingAddress: body.shippingAddress || null,
      shippingCity: body.shippingCity || null,
      shippingState: body.shippingState || null,
      shippingCountry: body.shippingCountry || null,
      shippingPostalCode: body.shippingPostalCode || null,
      description: body.description || null,
      notes: body.notes || null,
      status: body.status || "Active",
    },
  });
  return Response.json(account, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
