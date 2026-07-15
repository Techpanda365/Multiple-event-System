import { prisma } from "@/lib/db";
import { requireWorkspaceSession, unauthorized } from "@/lib/api-auth";

export async function POST() {
  const ctx = await requireWorkspaceSession();
  if (!ctx) return unauthorized();

  const settings = await prisma.setting.findMany({
    where: { group: `warehouses:${ctx.workspace.id}` },
  });

  let migrated = 0;
  for (const s of settings) {
    let data: Record<string, unknown>;
    try { data = JSON.parse(s.value); } catch { continue; }

    const exists = await prisma.warehouse.findFirst({
      where: { name: data.name as string, workspaceId: ctx.workspace.id },
    });
    if (exists) continue;

    await prisma.warehouse.create({
      data: {
        workspaceId: ctx.workspace.id,
        name: (data.name as string) || s.key,
        code: (data.code as string) || null,
        phone: (data.phone as string) || null,
        email: (data.email as string) || null,
        country: (data.country as string) || null,
        city: (data.city as string) || null,
        address: (data.address as string) || null,
        zipCode: (data.zipCode as string) || (data.code as string) || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    migrated++;
  }

  return Response.json({ migrated, total: settings.length });
}
