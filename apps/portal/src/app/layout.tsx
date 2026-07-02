import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Brand } from "@/components/Brand";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Nimbus — Developer Platform",
    template: "%s · Nimbus",
  },
  description:
    "Nimbus is a miniature cloud platform. Every application is a tenant on the platform — evolving from 10 to 10 million users.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="mx-auto flex min-h-screen w-full max-w-7xl">
          <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col gap-8 border-r border-white/5 px-4 py-6 lg:flex">
            <Brand />
            <Nav />
            <div className="mt-auto rounded-lg border border-white/5 bg-ink-900/40 px-3 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-600">
                Phase 0
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Foundation · targeting 10 users
              </p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            {/* Mobile header */}
            <header className="flex items-center justify-between border-b border-white/5 px-5 py-4 lg:hidden">
              <Brand />
            </header>

            <main className="flex-1 px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
              <div className="mx-auto w-full max-w-4xl">{children}</div>
            </main>

            <footer className="border-t border-white/5 px-5 py-6 text-xs text-slate-600 sm:px-8 lg:px-12">
              Nimbus · a miniature cloud platform · built in the open
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
