"use client";

import React from "react";
import { Layout } from "antd";
import { useAuthLayoutStyles } from "./styles";

export function AuthLayout({ children }: { children: React.ReactNode }) {
  const { styles } = useAuthLayoutStyles();

  return (
    <Layout className={styles.layout}>
      <Layout.Content className={styles.content}>{children}</Layout.Content>
    </Layout>
  );
}

