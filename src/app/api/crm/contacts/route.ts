import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const search = req.nextUrl.searchParams.get("search")?.trim();
  const accountId = req.nextUrl.searchParams.get("accountId");

  const contacts = await prisma.crmContact.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(accountId ? { accountId } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      } : {}),
    },
    include: { account: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return Response.json(contacts);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.firstName || !body.lastName) return badRequest("firstName and lastName are required");

  const contact = await prisma.crmContact.create({
    data: {
      workspaceId: ctx.workspace.id,
      firstName: body.firstName,
      lastName: body.lastName || ".",
      email: body.email || null,
      phone: body.phone || null,
      title: body.title || null,
      department: body.department || null,
      accountId: body.accountId || null,
      assignedTo: body.assignedTo || null,
      source: body.source || null,
      preferredContactMethod: body.preferredContactMethod || null,
      tags: body.tags || null,
      socialMediaUrl: body.socialMediaUrl || null,
      address: body.address || null,
      city: body.city || null,
      state: body.state || null,
      country: body.country || null,
      postalCode: body.postalCode || null,
      description: body.description || null,
      notes: body.notes || null,
      status: body.status || "Active",
    },
  });
  return Response.json(contact, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
