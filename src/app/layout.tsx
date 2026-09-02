import type { Metadata } from "next";
import { markaziText, vazirmatn } from "@/lib/fonts";
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
    <html
      lang="fa"
      dir="rtl"
      data-theme="warm-honey"
      className={`${vazirmatn.variable} ${markaziText.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-body text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
