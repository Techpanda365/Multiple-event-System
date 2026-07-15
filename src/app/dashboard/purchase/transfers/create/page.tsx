import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreateTransferClient } from "./create-transfer-client";

export default async function CreateTransferPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return <CreateTransferClient />;
}
