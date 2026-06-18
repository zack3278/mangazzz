import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mangazet",
  description: "Манга, манхва, комик унших сайт",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}