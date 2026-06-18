import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mangazet",
  description: "Manga унших сайт",
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