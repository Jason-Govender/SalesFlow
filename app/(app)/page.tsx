"use client";

import { Layout, Button, Space, Typography } from "antd";

export default function TestPage() {
  return (
    <Layout>
      <Layout.Content>
        <Space orientation="vertical" size="large">
          <Typography.Title level={3}>
            Config Test
          </Typography.Title>

          <Button type="primary">
            Primary Button
          </Button>
        </Space>
      </Layout.Content>
    </Layout>
  );
}