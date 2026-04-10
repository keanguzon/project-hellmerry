"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { X, Loader2, UploadCloud, User } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";

interface ProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProfileModal({ open, onClose, onSuccess }: ProfileModalProps) {
  const [fullName, setFullName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadProfile();
    } else {
      // Reset state on close
      setAvatarFile(null);
      setAvatarPreview(null);
    }
  }, [open]);

  const loadProfile = async () => {
    setFetching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFullName(user.user_metadata?.full_name || "");
        setAvatarPreview(user.user_metadata?.avatar_url || null);
      }
    } catch {
      // ignore
    } finally {
      setFetching(false);
    }
  };

  if (!open) return null;

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      toast({ title: "Name required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let newAvatarUrl = user.user_metadata?.avatar_url;

      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop();
        const avatarFileName = `${user.id}/${Date.now()}_avatar.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(avatarFileName, avatarFile, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarFileName);

        newAvatarUrl = publicUrlData.publicUrl;
      }

      // Update auth user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName.trim(),
          avatar_url: newAvatarUrl,
        }
      });

      if (updateError) throw updateError;

      toast({ title: "Profile updated successfully!", variant: "success" });
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Error updating profile",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-white text-glow">Edit Profile</h2>

        {fetching ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-3 flex flex-col items-center justify-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden bg-black/50 border-2 border-primary shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-input">
                    <User className="w-10 h-10 text-muted" />
                  </div>
                )}
              </div>
              <label className="cursor-pointer group flex items-center gap-2 text-xs font-medium text-primary hover:text-white transition-colors">
                <UploadCloud className="w-4 h-4" />
                Change Avatar
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Display Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="w-full h-11 px-3 rounded-lg bg-input border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full py-6 text-lg font-bold glow"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Profile"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
