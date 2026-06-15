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
    <html lang="fr" className={`${jetbrainsMono.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('bde-dark')==='1')document.documentElement.classList.add('dark')}catch(e){}` }} />
        <script dangerouslySetInnerHTML={{ __html: `(function(d){var config={kitId:'zof5bsa',scriptTimeout:3000,async:true},h=d.documentElement,t=setTimeout(function(){h.className=h.className.replace(/\bwf-loading\b/g,"")+" wf-inactive";},config.scriptTimeout),tk=d.createElement("script"),f=false,s=d.getElementsByTagName("script")[0],a;h.className+=" wf-loading";tk.src='https://use.typekit.net/'+config.kitId+'.js';tk.async=true;tk.onload=tk.onreadystatechange=function(){a=this.readyState;if(f||a&&a!="complete"&&a!="loaded")return;f=true;clearTimeout(t);try{Typekit.load(config)}catch(e){}};s.parentNode.insertBefore(tk,s)})(document);` }} />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gaegu&display=swap" />
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
