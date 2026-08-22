import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sonner";

const SITE_URL = "https://warebase.store";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "WareBase — Every item, in its place.",
    template: "%s · WareBase",
  },
  description:
    "The base layer for inventory that stays organized on its own. Real-time stock tracking, intelligent purchasing, approvals, and warehouse control in one elegant platform.",
  applicationName: "WareBase",
  authors: [{ name: "WareBase" }],
  creator: "WareBase",
  publisher: "WareBase",
  category: "Business",
  keywords: [
    "inventory management",
    "warehouse management",
    "stock tracking",
    "barcode scanner",
    "purchase orders",
    "supply chain",
    "warebase",
  ],
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "WareBase",
    title: "WareBase — Every item, in its place.",
    description:
      "Real-time stock tracking, intelligent purchasing, approvals, and warehouse control in one elegant platform.",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "WareBase — Every item, in its place.",
    description:
      "Real-time stock tracking, intelligent purchasing, approvals, and warehouse control in one elegant platform.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export const viewport: Viewport = {
  themeColor: "#151F38",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans antialiased text-foreground">
        {children}
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
