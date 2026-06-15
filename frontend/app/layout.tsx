import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { NavLink } from "@/components/NavLink";
import "./globals.css";

export const metadata: Metadata = {
  title: "SENTINEL — Scam Conversation Detector",
  description: "AI-powered online scam conversation detection. Paste any message, get an instant verdict.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,   // prevent accidental zoom on form tap (iOS)
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-50 border-b border-[var(--color-cream-200)] bg-white/90 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="w-7 h-7 rounded-lg bg-[var(--color-brown-700)] flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M7 1L1.5 3.5V7C1.5 10.1 4 12.9 7 13.5C10 12.9 12.5 10.1 12.5 7V3.5L7 1Z" fill="white" fillOpacity="0.9" />
                  <path d="M4.5 7L6.2 8.7L9.5 5.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span
                className="font-semibold text-[var(--color-brown-800)] tracking-tight hidden xs:block sm:block"
                style={{ fontFamily: "var(--font-display)" }}
              >
                SENTINEL
              </span>
            </Link>

            {/* Nav — always visible, shrinks gracefully */}
            <nav className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
              <NavLink href="/">Analyze</NavLink>
              <NavLink href="/history">History</NavLink>
              <NavLink href="/stats">Dashboard</NavLink>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-56px)] w-full">
          {children}
        </main>

        <footer className="border-t border-[var(--color-cream-200)] mt-12 py-5">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-xs text-[var(--color-brown-400)] leading-relaxed">
              SENTINEL · Decision-support tool — always verify suspicious requests independently.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
