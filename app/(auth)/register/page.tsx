"use client";

import dynamic from "next/dynamic";
import { Spin } from "antd";

const DynamicRegisterContent = dynamic(
  () => import("./RegisterPageContent"),
  {
    loading: () => (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 280 }}>
        <Spin size="large" />
      </div>
    ),
    ssr: false,
  }
);

export default function RegisterPage() {
  return <DynamicRegisterContent />;
}
