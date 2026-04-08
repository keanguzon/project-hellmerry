"use client";

import Link from "next/link";
import { Rocket, BookOpen, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Galaxy from "@/components/Galaxy";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center overflow-hidden">
      {/* Galaxy Background */}
      <div className="fixed inset-0 z-0">
        <Galaxy
          starSpeed={0.5}
          density={1}
          hueShift={320}
          speed={1}
          glowIntensity={0.8}
          saturation={1}
          mouseRepulsion={false}
          repulsionStrength={2}
          twinkleIntensity={0.5}
          rotationSpeed={0.1}
          transparent={false}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
        {/* Floating icon */}
        <div className="animate-float mb-8">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center border-glow">
            <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
          </div>
        </div>

        {/* Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-4 animate-fade-up text-glow-strong"
          style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}
        >
          PROJECT
          <br />
          <span className="text-primary">HELLMERRY</span>
        </h1>

        {/* Tagline */}
        <p
          className="text-lg sm:text-xl text-muted max-w-md mb-10 animate-fade-up"
          style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}
        >
          Your personal library, adrift among the stars.
        </p>

        {/* CTA */}
        <div
          className="animate-fade-up"
          style={{ animationDelay: "0.5s", animationFillMode: "backwards" }}
        >
          <Link href="/login">
            <Button size="lg" className="text-base px-10">
              Enter the Library
            </Button>
          </Link>
        </div>

        {/* Features strip */}
        <div
          className="mt-16 grid grid-cols-3 gap-6 sm:gap-10 w-full max-w-sm animate-fade-up"
          style={{ animationDelay: "0.7s", animationFillMode: "backwards" }}
        >
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted">Upload</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Rocket className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted">Read</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Bookmark className="w-5 h-5 text-primary" />
            <span className="text-xs text-muted">Bookmark</span>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[5]" />
    </div>
  );
}
