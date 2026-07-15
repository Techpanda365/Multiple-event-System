import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreatePurchaseInvoiceClient } from "./create-purchase-invoice-client";

export default async function CreatePurchaseInvoicePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CreatePurchaseInvoiceClient />;
}
