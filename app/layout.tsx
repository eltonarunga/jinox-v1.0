import type { Metadata, Viewport } from "next";
import { SiteNavigation } from "@/components/site-navigation";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#171717",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "JinoX AI — Data Operations Platform",
  description: "A governed workspace for collecting, curating, annotating, reviewing and preparing oral and craniofacial health datasets.",
  authors: [{ name: "JinoX AI Project Team" }],
  keywords: ["JinoX AI", "AI data operations", "Oral-health datasets", "Craniofacial data", "Data annotation", "Dataset quality"],
  openGraph: {
    title: "JinoX AI — Data Operations Platform",
    description: "Collect, curate, annotate and prepare trusted oral and craniofacial health datasets.",
    type: "website",
    locale: "en_KE",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f7f7f6] text-neutral-900 antialiased">
        <SiteNavigation />
        <div className="app-content flex min-h-screen min-w-0 flex-col">
          <div className="flex-1">{children}</div>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
