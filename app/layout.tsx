import type { Metadata } from "next";
import { AppConfigProvider } from "@/providers/config-provider";

import "./globals.css";
import { AuthProvider } from "../providers/auth-provider";

import "antd/dist/reset.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
