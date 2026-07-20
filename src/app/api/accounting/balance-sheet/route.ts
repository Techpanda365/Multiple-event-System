import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { requireAnySession, unauthorized } from "@/lib/api-auth";

const SUBTYPE_MAP: Record<string, string> = {
  "Cash": "currentAssets",
  "Bank": "currentAssets",
  "Accounts Receivable": "currentAssets",
  "Inventory": "currentAssets",
  "Current Asset": "currentAssets",
  "Fixed Asset": "fixedAssets",
  "Fixed": "fixedAssets",
  "Intangible": "otherAssets",
  "Other Asset": "otherAssets",
  "Current Liability": "currentLiabilities",
  "Current": "currentLiabilities",
  "Long Term Liability": "longTermLiabilities",
  "Long Term": "longTermLiabilities",
  "Equity": "ownersEquity",
  "Owner's Equity": "ownersEquity",
};

function categorize(acct: { type: string; subtype: string | null; code: string; name: string }): { group: string; bucket: string } {
  const t = acct.type?.toLowerCase() || "";
  const s = acct.subtype || "";

  if (t === "asset") {
    const bucket = SUBTYPE_MAP[s] || (acct.code?.startsWith("1") ? "currentAssets" : "fixedAssets");
    return { group: "assets", bucket };
  }
  if (t === "liability") {
    const bucket = SUBTYPE_MAP[s] || (acct.code?.startsWith("2") ? "currentLiabilities" : "longTermLiabilities");
    return { group: "liabilities", bucket };
  }
  if (t === "equity") {
    return { group: "equity", bucket: "ownersEquity" };
  }
  return { group: "other", bucket: "other" };
}

export async function GET(req: NextRequest) {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const asOfDate = req.nextUrl.searchParams.get("asOfDate") || undefined;

  const accounts = await prisma.chartOfAccount.findMany({
    where: { workspaceId: ctx.workspace.id, type: { in: ["Asset", "Liability", "Equity"] } },
    select: { code: true, name: true, type: true, subtype: true, currentBalance: true },
    orderBy: { code: "asc" },
  });

  const result: Record<string, any> = { asOfDate: asOfDate || new Date().toISOString().split("T")[0] };
  const buckets: Record<string, Record<string, { name: string; amount: number }[]>> = {
    assets: { currentAssets: [], fixedAssets: [], otherAssets: [] },
    liabilities: { currentLiabilities: [], longTermLiabilities: [] },
    equity: { ownersEquity: [] },
  };

  for (const acct of accounts) {
    if (acct.currentBalance === 0) continue;
    const { group, bucket } = categorize(acct);
    const list = buckets[group]?.[bucket];
    if (list) {
      list.push({ name: acct.name, amount: acct.currentBalance });
    }
  }

  const body = buildResponse(result.asOfDate, buckets);
  return Response.json(body);
}

function buildResponse(asOfDate: string, buckets: any) {
  return {
    asOfDate,
    assets: {
      currentAssets: buckets.assets.currentAssets,
      fixedAssets: buckets.assets.fixedAssets,
      otherAssets: buckets.assets.otherAssets,
    },
    liabilities: {
      currentLiabilities: buckets.liabilities.currentLiabilities,
      longTermLiabilities: buckets.liabilities.longTermLiabilities,
    },
    equity: {
      ownersEquity: buckets.equity.ownersEquity,
    },
  };
}

export async function POST(req: NextRequest) {
  try {
  const ctx = await requireAnySession();
  if (!ctx) return unauthorized();
  if (!ctx.workspace) return Response.json({ error: "No workspace" }, { status: 400 });

  const body = await req.json();
  const asOfDate = body.asOfDate || new Date().toISOString().split("T")[0];

  const accounts = await prisma.chartOfAccount.findMany({
    where: { workspaceId: ctx.workspace.id, type: { in: ["Asset", "Liability", "Equity"] } },
    select: { code: true, name: true, type: true, subtype: true, currentBalance: true },
    orderBy: { code: "asc" },
  });

  const buckets: Record<string, Record<string, { name: string; amount: number }[]>> = {
    assets: { currentAssets: [], fixedAssets: [], otherAssets: [] },
    liabilities: { currentLiabilities: [], longTermLiabilities: [] },
    equity: { ownersEquity: [] },
  };

  for (const acct of accounts) {
    if (acct.currentBalance === 0) continue;
    const { group, bucket } = categorize(acct);
    const list = buckets[group]?.[bucket];
    if (list) list.push({ name: acct.name, amount: acct.currentBalance });
  }

  return Response.json(buildResponse(asOfDate, buckets));
} catch (error) {
  console.error("POST error:", error);
  return Response.json({ error: "Internal server error" }, { status: 500 });
}
}
