const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const warehouses = await prisma.warehouse.findMany();
  let fixed = 0;
  for (const w of warehouses) {
    const data = {};
    if (w.code === null) { data.code = ""; fixed++; }
    if (w.country === null) { data.country = ""; fixed++; }
    if (w.phone === null) { data.phone = ""; fixed++; }
    if (w.email === null) { data.email = ""; fixed++; }
    if (w.city === null) { data.city = ""; fixed++; }
    if (w.address === null) { data.address = ""; fixed++; }
    if (w.zipCode === null) { data.zipCode = ""; fixed++; }
    if (Object.keys(data).length > 0) {
      await prisma.warehouse.update({ where: { id: w.id }, data });
    }
  }
  console.log(`Fixed ${fixed} null fields across ${warehouses.length} warehouses`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
