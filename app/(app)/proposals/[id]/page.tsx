"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ProposalDetailRedirectPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string | undefined;

  useEffect(() => {
    if (id) {
      router.replace(`/opportunities/proposals/${id}`);
    }
  }, [router, id]);

  return null;
}
