"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditInvoiceRedirect() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/dashboard/sales-invoice/invoices/create?edit=${id}`);
  }, [id, router]);

  return null;
}
