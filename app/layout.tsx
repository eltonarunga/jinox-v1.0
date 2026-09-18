import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-ibm-sans",
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-ibm-mono",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0B4F4A",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "JinoX AI — Multimodal Oral & Craniofacial Health Platform",
  description:
    "Full-stack multimodal AI prototype fusing intraoral imaging, environmental groundwater fluoride telemetry, and craniofacial genomics for the Kenya pilot.",
  authors: [{ name: "JinoX AI Project Team" }],
  keywords: [
    "JinoX AI",
    "Oral Health",
    "Fluorosis Surveillance",
    "Multimodal AI",
    "Kenya Public Health",
    "Digital Twin",
    "Craniofacial Genomics",
  ],
  openGraph: {
    title: "JinoX AI — Multimodal Oral & Craniofacial Health Platform",
    description: "Multimodal AI diagnostics and environmental intelligence for endemic fluorosis.",
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
    <html
      lang="en"
      className={`${fraunces.variable} ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="font-body bg-bg text-ink min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
