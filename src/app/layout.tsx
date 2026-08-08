import type { Metadata } from "next";
import { Geist_Mono, Inter, Outfit } from "next/font/google";
import { Suspense } from "react";
import ErrorReporter from "@/components/ErrorReporter";
import TopProgressBar from "@/components/ui/TopProgressBar";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MapCars — Ride Sharing, Reimagined",
  description:
    "MapCars is the next-generation ride-sharing app coming soon to Southampton, Portsmouth, Chichester, Brighton and the South Coast. Safe, affordable, and available on iOS and Android.",
  icons: {
    icon: [
      { url: "/favicon.svg?v=20260808b", type: "image/svg+xml" },
      { url: "/favicon-32x32.png?v=20260808b", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png?v=20260808b", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico?v=20260808b", sizes: "any" },
    ],
    shortcut: "/favicon.ico?v=20260808b",
    apple: [
      { url: "/apple-touch-icon.png?v=20260808b", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=20260808b" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=20260808b" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=20260808b" />
        <link rel="shortcut icon" href="/favicon.ico?v=20260808b" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=20260808b" />
      </head>
      <body className="min-h-full flex flex-col">
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <ErrorReporter />
        {children}
      </body>
    </html>
  );
}

