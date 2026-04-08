"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Rocket, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Galaxy from "@/components/Galaxy";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="relative min-h-dvh">
      {/* Galaxy Background — fixed behind everything */}
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

      {/* Top Nav */}
      <header className="sticky top-0 z-30 glass-strong safe-top">
        <div className="flex items-center justify-between px-4 sm:px-6 h-14 sm:h-16 max-w-7xl mx-auto">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 touch-manipulation"
          >
            <Rocket className="w-6 h-6 text-primary" />
            <span className="text-sm sm:text-base font-bold text-glow tracking-wide">
              HAIL MARY LIBRARY
            </span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-muted hover:text-foreground gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </header>

      {/* Page content */}
      <main className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto safe-bottom">
        {children}
      </main>
    </div>
  );
}
