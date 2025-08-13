import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import RealtimeSync from "@/components/RealtimeSync";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "nightsu-app",
  description: "Local oneshot reader",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className="min-h-screen bg-brand-bg text-brand-text"
        style={{
          ["--brand-bg" as any]: "#1f2433",
          ["--brand-surface" as any]: "#2a3145",
          ["--brand-muted" as any]: "#3a435a",
          ["--brand-border" as any]: "#3a435a",
          ["--brand-text" as any]: "#e6eaf2",
          ["--brand-subtext" as any]: "#aab2c5",
          ["--brand-primary" as any]: "#1ec8ff",
          ["--brand-secondary" as any]: "#37d67a",
        }}
      >
        <header className="bg-brand-surface border-b border-brand-border">
          <div className="max-w-6xl mx-auto p-4 flex items-center justify-between gap-4">
            <Link href="/" className="font-extrabold tracking-wide">
              <span className="text-brand-primary">NIGHT</span>
              <span className="text-brand-secondary">SU</span>
              <span className="ml-2 text-sm opacity-70">SPACE</span>
            </Link>
            <nav className="flex items-center gap-3 text-brand-subtext">
              <Link href="/" className="hover:text-brand-primary transition">
                Home
              </Link>
              <Link
                href="/admin"
                className="hover:text-brand-primary transition"
              >
                Admin
              </Link>
            </nav>
          </div>
        </header>
        <RealtimeSync />
        <main className="bg-brand-bg">{children}</main>
      </body>
    </html>
  );
}
