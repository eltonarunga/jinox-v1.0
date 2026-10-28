import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "JinoX AI — Dental Data & Annotation Platform",
  description:
    "Research data infrastructure for ethically governed East African oral-health datasets, expert annotation, quality review and dataset delivery.",
  authors: [{ name: "JinoX AI Project Team" }],
  keywords: [
    "JinoX AI",
    "Dental datasets",
    "Oral-health research",
    "Clinical data annotation",
    "East African health AI",
    "Dataset quality",
  ],
  openGraph: {
    title: "JinoX AI — Dental Data & Annotation Platform",
    description:
      "Collect, curate, annotate and deliver trusted oral-health research datasets.",
    type: "website",
    locale: "en_KE",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable} ${inter.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=optional"
        />
      </head>
      <body className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
