import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smartwear Studio",
  description: "Design interactive merchandise with NFC and scan-to-play media.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
