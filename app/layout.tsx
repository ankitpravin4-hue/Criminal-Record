import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import type { Metadata } from "next";
import { AuditBootstrap } from "@/components/AuditBootstrap";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-plex-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "GraphSentry — Criminal Network Intelligence",
  description:
    "AI-powered criminal network analysis dashboard. Synthetic Smart India Hackathon prototype — not real persons or investigations.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${plexSans.variable} ${plexMono.variable}`}>
      <body className="font-sans antialiased">
        <AuditBootstrap>
          <div className="min-h-screen bg-ink-900 bg-radial-fade">
            <SiteHeader />
            {children}
          </div>
        </AuditBootstrap>
      </body>
    </html>
  );
}
