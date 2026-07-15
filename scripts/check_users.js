const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
  const users = await prisma.user.findMany({ where: { email: "rajesh@123.com" } });
  console.log("Count:", users.length);
  users.forEach(u => console.log(u.id, u.name, u.role, u.createdAt));
  if (users.length > 1) {
    console.log("Multiple users found! Updating all...");
    for (const u of users) {
      await prisma.user.update({ where: { id: u.id }, data: { role: "SUPER_ADMIN" } });
      console.log("Updated:", u.id, "-> SUPER_ADMIN");
    }
  } else if (users.length === 1) {
    const u = users[0];
    console.log("Current role:", u.role);
    if (u.role !== "SUPER_ADMIN") {
      await prisma.user.update({ where: { id: u.id }, data: { role: "SUPER_ADMIN" } });
      console.log("Updated to SUPER_ADMIN");
    } else {
      console.log("Already SUPER_ADMIN");
    }
  } else {
    console.log("No user found with rajesh@123.com");
  }
  await prisma.$disconnect();
}
main().catch(e => { console.error(e); process.exit(1); });
