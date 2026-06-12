import type { Metadata } from "next";
import { JetBrains_Mono, Inter } from "next/font/google";
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

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BDE LISAA DGC",
  description: "Le Bureau des Étudiants de LISAA DGC",
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
    ],
    apple: '/favicon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jetbrainsMono.variable} ${inter.variable}`}>
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/zof5bsa.css" />
      </head>
      <body>
        <GtmLoader />
        {children}
        <SitePopup />
        <CookieConsent />
      </body>
    </html>
  );
}
