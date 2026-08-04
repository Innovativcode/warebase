import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Toaster } from "sonner";
import { WarebaseBootScreen } from "@/components/loader/boot-screen";

export const metadata: Metadata = {
  title: "WareBase",
  description: "Every item, in its place. The base layer for inventory that stays organized on its own.",
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="bg-background font-sans antialiased text-foreground">
        {children}
        <WarebaseBootScreen />
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}
