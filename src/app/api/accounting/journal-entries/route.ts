import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { badRequest, requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function GET(req: NextRequest) {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const status = req.nextUrl.searchParams.get("status");

  const entries = await prisma.journalEntry.findMany({
    where: {
      workspaceId: ctx.workspace.id,
      ...(status ? { status } : {}),
    },
    include: {
      lines: {
        include: { account: { select: { id: true, code: true, name: true } } },
      },
    },
    orderBy: { date: "desc" },
  });
  return Response.json(entries);
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const body = await req.json();
  if (!body.date || !Array.isArray(body.lines) || body.lines.length < 2) {
    return badRequest("date and at least 2 journal lines are required");
  }

  const totalDebit = body.lines
    .filter((l: any) => l.type === "DEBIT")
    .reduce((s: number, l: any) => s + Number(l.amount), 0);
  const totalCredit = body.lines
    .filter((l: any) => l.type === "CREDIT")
    .reduce((s: number, l: any) => s + Number(l.amount), 0);

  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    return badRequest("Total debits must equal total credits");
  }

  const count = await prisma.journalEntry.count({ where: { workspaceId: ctx.workspace.id } });
  const entryNumber = `JE-${String(count + 1).padStart(5, "0")}`;

  const entry = await prisma.journalEntry.create({
    data: {
      workspaceId: ctx.workspace.id,
      entryNumber,
      date: new Date(body.date),
      description: body.description || null,
      reference: body.reference || null,
      status: body.status || "DRAFT",
      totalDebit,
      totalCredit,
      createdBy: ctx.user.id,
      lines: {
        create: body.lines.map((l: any) => ({
          accountId: l.accountId,
          type: l.type,
          amount: Number(l.amount),
          description: l.description || null,
        })),
      },
    },
    include: { lines: true },
  });
  return Response.json(entry, { status: 201 });
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
