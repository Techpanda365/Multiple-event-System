import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { StockClient } from "./stock-client";

export default async function StockPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  const stock = products.map((p) => ({
    id: p.id,
    product: p.name,
    sku: p.sku ?? "-",
    quantity: p.stock || 0,
  }));

  return <StockClient stock={stock} />;
}
