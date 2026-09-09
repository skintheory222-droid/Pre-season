import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Preseason Dashboard",
  description: "60-day music/DJ/language learning program tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
