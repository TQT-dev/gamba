import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gamba Arcade",
  description: "Virtual coin arcade with skill-based mini-games. For entertainment only.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="max-w-5xl mx-auto px-4 py-6">{children}</body>
    </html>
  );
}
