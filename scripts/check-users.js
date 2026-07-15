const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
  const users = await p.user.findMany({ take: 5, select: { email: true, name: true, role: true } });
  console.log("Total users:", users.length);
  users.forEach(u => console.log(u.email, u.name, u.role));
  await p.$disconnect();
}
main();
