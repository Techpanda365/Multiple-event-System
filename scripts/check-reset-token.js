const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
async function main() {
  const u = await p.user.findUnique({ where: { email: "rajesh@123.com" } });
  if (u) {
    console.log("resetToken:", u.resetToken ? u.resetToken.substring(0, 20) + "..." : "null");
    console.log("resetTokenExpiry:", u.resetTokenExpiry);
  } else {
    console.log("User not found");
  }
  await p.$disconnect();
}
main();
