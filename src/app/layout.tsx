import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SitePopup from "@/components/SitePopup";
import CookieConsent from "@/components/CookieConsent";
import GtmLoader from "@/components/GtmLoader";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Trends News — Veille IA quotidienne",
  description: "Les dernières tendances en intelligence artificielle",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jetbrainsMono.variable}>
      <body>
        <GtmLoader />
        {children}
        <SitePopup />
        <CookieConsent />
      </body>
    </html>
  );
}
