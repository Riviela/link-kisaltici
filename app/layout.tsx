import type { Metadata } from "next";
import { Schibsted_Grotesk } from "next/font/google";

import { copy } from "@/lib/copy";

import "./globals.css";

const schibstedGrotesk = Schibsted_Grotesk({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-app",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: copy.metadata.title,
  description: copy.metadata.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className={schibstedGrotesk.variable} lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
