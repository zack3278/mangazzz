import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Unshy",
  description: "Comic reader website",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body>{children}</body>
    </html>
  );
}