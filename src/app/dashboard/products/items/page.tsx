import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { getUserWorkspace } from "@/lib/workspace";
import { ProductsClient } from "./products-client";

export default async function ProductsItemsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const workspace = await getUserWorkspace(session.user.id);
  const wid = workspace?.id ?? "";

  const products = await prisma.product.findMany({
    where: { workspaceId: wid },   // ✅ sirf is workspace ke products
    orderBy: { createdAt: "desc" },
  });

  return <ProductsClient user={session.user} initialProducts={products} />;
}
