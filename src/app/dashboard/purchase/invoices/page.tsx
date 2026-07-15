import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PurchaseInvoicesClient } from "./purchase-invoices-client";

export default async function PurchaseInvoicesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  return <PurchaseInvoicesClient />;
}
