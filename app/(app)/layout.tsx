"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ConfigProvider, Spin } from "antd";
import { useAuthState } from "@/providers/auth-provider";
import { DashboardProvider } from "@/providers/dashboard-provider";
import { ClientsProvider } from "@/providers/clients-provider";
import { ContactsProvider } from "@/providers/contacts-provider";
import { ContractsProvider } from "@/providers/contracts-provider";
import { OpportunitiesProvider } from "@/providers/opportunities-provider";
import { ProposalsProvider } from "@/providers/proposals-provider";
import { AppShell } from "@/components/app-shell";
import { hasAccess } from "@/utils/route-roles";
import { useAppLayoutStyles } from "./layoutStyles";

const ORANGE_PRIMARY = "#e85d04";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { styles } = useAppLayoutStyles();
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
      <div className={styles.spinWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.spinWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  if (!hasAccess(session.user.roles, pathname ?? "/")) {
    return (
      <div className={styles.spinWrapper}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: ORANGE_PRIMARY,
        },
      }}
    >
      <DashboardProvider>
        <ClientsProvider>
          <ContactsProvider>
            <ContractsProvider>
              <OpportunitiesProvider>
                <ProposalsProvider>
                <AppShell>{children}</AppShell>
                </ProposalsProvider>
              </OpportunitiesProvider>
            </ContractsProvider>
          </ContactsProvider>
        </ClientsProvider>
      </DashboardProvider>
    </ConfigProvider>
  );
}
