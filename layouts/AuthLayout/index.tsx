"use client";

import React from "react";
import { ConfigProvider, Layout } from "antd";
import { useAuthLayoutStyles } from "./styles";

const ORANGE_PRIMARY = "#e85d04";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { styles } = useAuthLayoutStyles();

  return (
    <ConfigProvider
      theme={{
        token: { colorPrimary: ORANGE_PRIMARY, colorLink: ORANGE_PRIMARY },
        components: { Spin: { colorPrimary: ORANGE_PRIMARY } },
      }}
    >
      <Layout className={styles.layout}>
        <Layout.Content className={styles.content}>{children}</Layout.Content>
      </Layout>
    </ConfigProvider>
  );
}

