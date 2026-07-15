const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const accounts = await prisma.chartOfAccount.findMany({ select: { code: true, name: true, type: true, subtype: true, currentBalance: true } });
  console.log(JSON.stringify(accounts, null, 2));
  await prisma.$disconnect();
}
main().catch(e => { console.error(e.message); process.exit(1); });
