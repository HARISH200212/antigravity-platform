import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AntiGravity Technologies | AGT-LEV Platform",
  description:
    "AI-Driven Electromagnetic Levitation & Propulsion Research Suite — Next-Generation Intelligent Field Control Platform for advanced propulsion research teams.",
  keywords: "electromagnetic levitation, propulsion, AI field optimization, magnetic flux, research platform",
  authors: [{ name: "AntiGravity Technologies Engineering Division" }],
  robots: "noindex, nofollow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#020b18" />
      </head>
      <body>{children}</body>
    </html>
  );
}
