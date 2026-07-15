import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PurchaseReturnsClient } from "./purchase-returns-client";

export default async function PurchaseReturnsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <PurchaseReturnsClient />;
}
