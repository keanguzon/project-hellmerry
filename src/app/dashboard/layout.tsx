"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Rocket, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
