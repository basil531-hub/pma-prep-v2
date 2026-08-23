import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { SiteFooter } from "@/components/site-footer";
import { DesktopDropdownCloser } from "@/components/desktop-dropdown-closer";
import { PublicChrome } from "@/components/public-chrome";
import Script from "next/script";

export const metadata: Metadata = { title: "PMA Prep | ISSB Preparation", description: "Structured ISSB and PMA preparation for Pakistan's future officers." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT&&<Script async strategy="afterInteractive" crossOrigin="anonymous" src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`} />}
        <PublicChrome navbar={<><Navbar /><DesktopDropdownCloser /></>} footer={<SiteFooter />}>
          {children}
        </PublicChrome>
      </body>
    </html>
  );
}
