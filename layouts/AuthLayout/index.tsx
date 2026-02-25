"use client";

import type { ReactNode } from "react";
import { Layout, Row, Col, Space } from "antd";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Layout>
      <Layout.Content>
        <Row justify="center" align="middle">
          <Col xs={22} sm={16} md={12} lg={8} xl={6}>
            <Space orientation="vertical" size="large">
              {children}
            </Space>
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  );
}