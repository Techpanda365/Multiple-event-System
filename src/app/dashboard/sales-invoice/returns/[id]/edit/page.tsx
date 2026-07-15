"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditReturnPage() {
  const { id } = useParams();
  const router = useRouter();

  useEffect(() => {
    if (id) router.replace(`/dashboard/sales-invoice/returns/create?edit=${id}`);
  }, [id, router]);

  return null;
}
