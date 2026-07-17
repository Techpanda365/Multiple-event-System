import { prisma } from "@/lib/db";

export async function updateStock(
  items: any[],
  operation: "increase" | "decrease",
  productIdField = "productId",
  qtyField = "quantity",
) {
  for (const item of items) {
    const pid = item[productIdField];
    const qty = item[qtyField] || 0;
    if (!pid || qty <= 0) continue;

    const product = await prisma.product.findUnique({ where: { id: pid } });
    if (!product || !product.trackInventory) continue;

    const change = operation === "increase" ? qty : -qty;
    await prisma.product.update({
      where: { id: pid },
      data: { stock: Math.max(0, product.stock + change) },
    });
  }
}
