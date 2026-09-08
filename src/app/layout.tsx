import type { Metadata } from "next";
import { lalezar, vazirmatn } from "@/lib/fonts";
import { strings } from "@/lib/fa/strings";
import "./globals.css";

export const metadata: Metadata = {
  title: strings.meta.title,
  description: strings.meta.description,
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} ${lalezar.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}