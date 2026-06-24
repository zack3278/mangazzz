import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mangazet",
  description: "Premium manga reader website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}