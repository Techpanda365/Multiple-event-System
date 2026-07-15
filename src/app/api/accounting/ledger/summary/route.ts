import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

export async function GET() {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const lines = await prisma.journalEntryLine.findMany({
    where: { journalEntry: { workspaceId: ctx.workspace.id } },
    include: {
      journalEntry: { select: { date: true, reference: true, description: true } },
      account: { select: { code: true, name: true } },
    },
    orderBy: { journalEntry: { date: "desc" } },
  });

  const entries = lines.map((line, idx) => ({
    id: idx + 1,
    date: line.journalEntry.date.toISOString().split("T")[0],
    accountCode: line.account.code,
    accountName: line.account.name,
    reference: line.journalEntry.reference || "",
    description: line.journalEntry.description || "",
    debit: line.type === "DEBIT" ? line.amount : null,
    credit: line.type === "CREDIT" ? line.amount : null,
  }));

  return Response.json(entries);
}
