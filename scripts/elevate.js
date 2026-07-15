const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: "rajesh@123.com" } });
  if (!user) { console.log("User not found"); return; }
  console.log("Current role:", user.role);
  const updated = await prisma.user.update({
    where: { email: "rajesh@123.com" },
    data: { role: "SUPER_ADMIN" },
  });
  console.log("Updated role:", updated.role);
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
