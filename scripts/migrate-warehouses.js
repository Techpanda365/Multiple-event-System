const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const settings = await prisma.setting.findMany({
    where: { group: { startsWith: "warehouses:" } },
  });

  let migrated = 0;
  for (const s of settings) {
    let data;
    try { data = JSON.parse(s.value); } catch { continue; }

    const wsId = s.group.replace("warehouses:", "");
    const exists = await prisma.warehouse.findFirst({
      where: { name: data.name, workspaceId: wsId },
    });
    if (exists) { migrated++; continue; }

    await prisma.warehouse.create({
      data: {
        workspaceId: wsId,
        name: data.name || s.key,
        code: data.code || null,
        phone: data.phone || null,
        email: data.email || null,
        country: data.country || null,
        city: data.city || null,
        address: data.address || null,
        zipCode: data.zipCode || data.code || null,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
    migrated++;
  }

  console.log(`Migrated ${migrated} of ${settings.length} warehouses`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
