"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Rocket, LogOut, UserCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import { ProfileModal } from "@/components/ProfileModal";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const supabase = createClient();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const loadUserProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserProfile(user.user_metadata);
    }
  };

  useEffect(() => {
    loadUserProfile();
  }, []);

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
            <span className="text-sm sm:text-base font-bold text-glow tracking-wide uppercase">
              HELLMERRY LIBRARY
            </span>
          </Link>
          
          <div className="flex items-center gap-2 sm:gap-4">
            {userProfile?.avatar_url ? (
              <button 
                onClick={() => setProfileOpen(true)}
                className="w-8 h-8 rounded-full overflow-hidden border border-primary/50 hover:border-primary transition-colors"
                title="Edit Profile"
              >
                <Image src={userProfile.avatar_url} alt="Profile" width={32} height={32} className="object-cover" />
              </button>
            ) : (
              <button 
                onClick={() => setProfileOpen(true)}
                className="w-8 h-8 rounded-full bg-primary/10 border border-primary/50 hover:border-primary flex items-center justify-center text-primary transition-colors"
                title="Edit Profile"
              >
                <UserCircle className="w-5 h-5" />
              </button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted hover:text-foreground gap-1.5 px-2"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="relative z-10 px-4 sm:px-6 py-6 sm:py-8 max-w-7xl mx-auto safe-bottom">
        {children}
      </main>

      <ProfileModal 
        open={profileOpen} 
        onClose={() => setProfileOpen(false)} 
        onSuccess={() => {
          setProfileOpen(false);
          loadUserProfile();
        }} 
      />
    </div>
  );
}
