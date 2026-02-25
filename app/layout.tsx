import type { Metadata } from "next";
import { AppConfigProvider } from "@/providers/config-provider";

import "./globals.css";

import "antd/dist/reset.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppConfigProvider>{children}</AppConfigProvider>
      </body>
    </html>
  );
}
