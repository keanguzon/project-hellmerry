"use client";

import { useState } from "react";
import Link from "next/link";
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
import { Loader2, ArrowLeft, Send } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const supabase = createClient();

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const redirectTo = `${window.location.origin}/auth/callback?redirect=${encodeURIComponent("/update-password")}`;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setSuccess(true);
      toast({
        title: "Reset link sent!",
        description: "Check your email inbox for further instructions.",
        variant: "success",
      });
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

        <CardHeader className="space-y-1 relative">
          <CardTitle className="text-2xl font-bold tracking-tight text-glow">
            Reset Password
          </CardTitle>
          <CardDescription className="text-muted text-sm">
            Enter your email to receive a password reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {success ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 border border-primary/50 text-primary flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(236,72,153,0.4)]">
                <Send className="w-8 h-8" />
              </div>
              <p className="text-foreground text-sm leading-relaxed">
                We've sent a password reset link to <strong>{email}</strong>.
                <br />
                Please check your inbox or spam folder.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResetRequest} className="space-y-4 relative">
              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black/50 border-white/10 text-white placeholder:text-muted focus-visible:ring-primary h-11"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 text-base font-semibold glow group mt-2"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center relative">
          <Link
            href="/login"
            className="text-sm font-medium text-muted hover:text-primary transition-colors hover:glow-text inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
