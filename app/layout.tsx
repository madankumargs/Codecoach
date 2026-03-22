import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

// 📚 Google Fonts in Next.js:
// Instead of loading fonts from a CDN (slow), Next.js downloads and hosts them locally.
// inter = clean, modern sans-serif for text; jetbrainsMono = for code display
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "CodeLab — AI-Powered Coding Assessment Platform",
  description:
    "Smart coding exams, AI-generated questions, and intelligent code evaluation for modern education.",
};

// 📚 ROOT LAYOUT:
// In Next.js App Router, layout.tsx wraps ALL pages inside it.
// The {children} prop is whatever page the user navigated to.
// This is perfect for things like headers, footers, and global providers.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#0F172A] text-white font-sans antialiased">
        {/* Providers wraps the app with session context so all pages know if user is logged in */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
