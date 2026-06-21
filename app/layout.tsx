import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";

import { copy } from "@/lib/copy";

import "./globals.css";

const instrumentSans = Instrument_Sans({
  display: "swap",
  subsets: ["latin", "latin-ext"],
  variable: "--font-app",
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
    <html className={instrumentSans.variable} lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
