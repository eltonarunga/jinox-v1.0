import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JinoX AI — Prototype System",
  description:
    "Full-stack prototype of the JinoX AI multimodal oral and craniofacial health platform, Kenya pilot.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-body">{children}</body>
    </html>
  );
}
