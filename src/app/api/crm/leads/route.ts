import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";
import { LeadStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const leads = await prisma.crmLead.findMany({
    where: {
      ...(status && status !== "ALL" ? { status: status as LeadStatus } : {}),
      workspaceId: ctx.workspace.id,
      ...(search
        ? {
            OR: [
              { title: { contains: search } },
              { company: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(leads);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const title = body.title?.trim();
  if (!title) return badRequest("Title is required");

  const lead = await prisma.crmLead.create({
    data: {
      workspaceId: ctx.workspace.id,
      title,
      subject: body.subject?.trim() || null,
      company: body.company?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      value: body.value != null ? Number(body.value) : null,
      followUpDate: body.followUpDate ? new Date(body.followUpDate) : null,
      status: (body.status as LeadStatus) || "NEW",
      source: body.source?.trim() || null,
      assignedTo: body.assignedTo?.trim() || null,
      assignedToId: body.assignedToId?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  });

  return Response.json(lead, { status: 201 });
}
