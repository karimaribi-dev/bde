import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SitePopup from "@/components/SitePopup";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Trends News — Veille IA quotidienne",
  description: "Les dernières tendances en intelligence artificielle",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jetbrainsMono.variable}>
      <body>
        {children}
        <SitePopup />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
