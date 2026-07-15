import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateWarehouseClient } from "./create-warehouse-client";

export default async function CreateWarehousePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CreateWarehouseClient />;
}
