import type { Metadata } from "next";

import "./globals.css";

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
        {children}
      </body>
    </html>
  );
}
