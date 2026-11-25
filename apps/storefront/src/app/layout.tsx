import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Crate & Cue: DJ equipment',
  description: 'Controllers, mixers, turntables, headphones, monitors, mics and cameras.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-zinc-950 font-sans text-zinc-100">
        <header className="border-b border-zinc-800">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-xl font-semibold tracking-tight">
              Crate <span className="text-amber-400">&amp;</span> Cue
            </Link>
            <nav aria-label="Main">
              <Link
                href="/cart"
                className="inline-flex min-h-11 items-center rounded px-3 hover:bg-zinc-900"
              >
                Cart
              </Link>
            </nav>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-zinc-800 px-4 py-6 text-center text-sm text-zinc-400">
          Demo store built to practise AWS infrastructure. No real orders are taken.
        </footer>
      </body>
    </html>
  );
}
