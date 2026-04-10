"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { X, Loader2, UploadCloud } from "lucide-react";
import type { Book } from "@/types/database";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";

interface EditBookModalProps {
  book: Book;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditBookModal({ book, open, onClose, onSuccess }: EditBookModalProps) {
  const [title, setTitle] = useState(book.book_title);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  if (!open) return null;

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      let newCoverUrl = book.cover_url;

      if (coverFile) {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error("Not authenticated");

        const ext = coverFile.name.split(".").pop();
        const coverFileName = `${userData.user.id}/${Date.now()}_cover.${ext}`;

        const { error: coverError } = await supabase.storage
          .from("covers")
          .upload(coverFileName, coverFile);

        if (coverError) throw coverError;

        const { data: publicUrlData } = supabase.storage
          .from("covers")
          .getPublicUrl(coverFileName);

        newCoverUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from("books")
        .update({ book_title: title.trim(), cover_url: newCoverUrl })
        .eq("id", book.id);

      if (error) throw error;

      toast({ title: "Book updated", variant: "success" });
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Error updating book",
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
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-white text-glow">Edit Book</h2>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Book Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3 rounded-lg bg-input border border-border text-foreground focus:ring-2 focus:ring-primary/50 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Replace Cover (Optional)</label>
            <div className="flex gap-4 items-center">
              <div className="w-20 h-32 relative rounded-md overflow-hidden bg-black/50 border border-border shrink-0">
                <Image
                  src={coverPreview || book.cover_url}
                  alt="Cover Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-border hover:border-primary/50 rounded-xl cursor-pointer transition-colors bg-white/5">
                <UploadCloud className="w-6 h-6 text-muted mb-2" />
                <span className="text-xs text-muted font-medium text-center px-4">
                  Click to select new cover
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCoverSelect}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading}
            className="w-full py-6 text-lg font-bold glow"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
