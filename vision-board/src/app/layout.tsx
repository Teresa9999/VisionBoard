import type { Metadata } from "next";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: "心愿愿景板",
  description: "发现你真正渴望的生活",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className="min-h-svh bg-[var(--color-cream)] font-body antialiased">
        <div className="relative min-h-svh">{children}</div>
        <Toaster />
      </body>
    </html>
  );
}
