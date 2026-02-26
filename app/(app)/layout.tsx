"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Spin } from "antd";
import { useAuthState } from "@/providers/auth-provider";
import { hasAccess } from "@/utils/route-roles";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { session, isAuthReady } = useAuthState();

  useEffect(() => {
    if (!isAuthReady) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    const allowed = hasAccess(session.user.roles, pathname ?? "/");
    if (!allowed) {
      router.replace("/?forbidden=1");
    }
  }, [isAuthReady, session, pathname, router]);

  if (!isAuthReady) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!session) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!hasAccess(session.user.roles, pathname ?? "/")) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}
