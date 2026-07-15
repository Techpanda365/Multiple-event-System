import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const stage = req.nextUrl.searchParams.get("stage");
  const search = req.nextUrl.searchParams.get("search")?.trim();

  const deals = await prisma.crmDeal.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(stage && stage !== "ALL" ? { stage } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { company: { contains: search } },
              { email: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  return Response.json(deals);
}

export async function POST(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  const name = body.name?.trim();
  if (!name) return badRequest("Name is required");

  const deal = await prisma.crmDeal.create({
    data: {
      workspaceId: ctx.workspace.id,
      name,
      company: body.company?.trim() || null,
      email: body.email?.trim() || null,
      phone: body.phone?.trim() || null,
      value: body.value != null ? Number(body.value) : null,
      stage: body.stage?.trim() || "lead",
      probability: body.probability != null ? Number(body.probability) : 0,
      source: body.source?.trim() || null,
      assignedTo: body.assignedTo?.trim() || null,
      notes: body.notes?.trim() || null,
    },
  });

  return Response.json(deal, { status: 201 });
}
