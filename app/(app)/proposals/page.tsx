"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProposalsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/opportunities/proposals");
  }, [router]);
  return null;
}
