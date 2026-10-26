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
  title: "JinoX AI — Clinical Workstation & Multimodal Platform",
  description:
    "Full-stack multimodal AI platform fusing intraoral imaging, environmental groundwater fluoride telemetry, and craniofacial genomics for the Kenya pilot.",
  authors: [{ name: "JinoX AI Project Team" }],
  keywords: [
    "JinoX AI",
    "Clinical Workstation",
    "Fluorosis Surveillance",
    "Multimodal AI",
    "Kenya Rift Valley",
    "Digital Twin",
    "Edge Diagnostics",
  ],
  openGraph: {
    title: "JinoX AI — Clinical Workstation",
    description: "Multimodal AI diagnostics and climate-health intelligence for endemic fluorosis.",
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
      className={`${plusJakartaSans.variable} ${inter.variable}`}
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-background font-body-md text-on-surface min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
