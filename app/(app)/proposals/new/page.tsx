"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProposalRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/opportunities/proposals/new");
  }, [router]);
  return null;
}
