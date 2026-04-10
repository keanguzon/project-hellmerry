"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";
import { Loader2, KeyRound } from "lucide-react";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClient();

  // Supabase automatically handles the access_token in the URL hash and establishes a session.
  // We just need to call updateUser() to set the new password on that active session.

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Passwords mismatch",
        description: "The passwords you entered do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Your password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: "Error resetting password",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Password updated successfully!",
        description: "You have securely changed your password.",
        variant: "success",
      });

      // Clear the hash from the URL and redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <Card className="w-full max-w-[400px] border-border bg-black/60 backdrop-blur-xl shadow-[0_0_50px_rgba(236,72,153,0.15)] relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        <CardHeader className="space-y-1 relative text-center">
          <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/50 text-primary flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(236,72,153,0.4)] mb-2">
            <KeyRound className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-glow">
            Set New Password
          </CardTitle>
          <CardDescription className="text-muted text-sm">
            Please enter your new password below to secure your account.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleUpdatePassword} className="space-y-4 relative">
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                New Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-black/50 border-white/10 text-white placeholder:text-muted focus-visible:ring-primary h-11"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Confirm New Password
              </label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="********"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-black/50 border-white/10 text-white placeholder:text-muted focus-visible:ring-primary h-11"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 text-base font-semibold glow group mt-4"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                "Save Password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
