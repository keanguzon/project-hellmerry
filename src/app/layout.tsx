import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/Toaster";
import Galaxy from "@/components/Galaxy";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project Hellmerry — Ebook Library",
  description:
    "Your personal ebook library adrift among the stars. Upload, read, and bookmark your books with a realistic page-flipping experience.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0f",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Single global Galaxy background — fixed behind every page */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <Galaxy
            mouseInteraction={true}
            mouseRepulsion={false}
            density={0.5}
            glowIntensity={0.6}
            saturation={1}
            hueShift={320}
            twinkleIntensity={0.4}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.3}
            speed={1}
            transparent={false}
          />
        </div>
        <Toaster>
          {children}
        </Toaster>
      </body>
    </html>
  );
}
