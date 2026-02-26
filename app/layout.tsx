import type { Metadata } from "next";

import "./globals.css";
import { AuthProvider } from "../providers/auth-provider";

export const metadata: Metadata = {
  title: "SalesFlow",
  description: "A Sales Pipeline Management Tool",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
