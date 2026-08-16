import type { Metadata, Viewport } from "next";
import { Noto_Sans_Thai } from "next/font/google";
import "./globals.css";

// Self-hosted by next/font at build time: no render-blocking request to
// Google, and no layout shift from a late swap.
const notoThai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "700", "800"],
  display: "swap",
  variable: "--font-noto-thai",
});

export const metadata: Metadata = {
  title: "HamsterHub",
  description: "SciGameLab Camp — สรุปการสมัครและหน้าขอบคุณ",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={notoThai.variable}>
      <body style={{ fontFamily: "var(--font-noto-thai), sans-serif" }}>{children}</body>
    </html>
  );
}
