"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { Upload, FileText, ImageIcon, Loader2 } from "lucide-react";

interface UploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadModal({ open, onClose, onSuccess }: UploadModalProps) {
  const [title, setTitle] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const supabase = createClient();

  const reset = () => {
    setTitle("");
    setPdfFile(null);
    setCoverFile(null);
    setProgress(0);
    if (pdfInputRef.current) pdfInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!pdfFile || !coverFile || !title.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setProgress(10);

    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in",
          variant: "destructive",
        });
        return;
      }

      const timestamp = Date.now();
      const safeName = title.trim().replace(/[^a-zA-Z0-9]/g, "_");

      // 1. Upload PDF
      setProgress(20);
      const pdfPath = `${user.id}/${safeName}_${timestamp}.pdf`;
      const { error: pdfError } = await supabase.storage
        .from("books")
        .upload(pdfPath, pdfFile, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (pdfError) throw new Error(`PDF upload failed: ${pdfError.message}`);
      setProgress(50);

      // 2. Upload cover
      const coverExt = coverFile.name.split(".").pop() || "jpg";
      const coverPath = `${user.id}/${safeName}_${timestamp}.${coverExt}`;
      const { error: coverError } = await supabase.storage
        .from("covers")
        .upload(coverPath, coverFile, {
          contentType: coverFile.type,
          upsert: false,
        });

      if (coverError)
        throw new Error(`Cover upload failed: ${coverError.message}`);
      setProgress(75);

      // 3. Get public URLs
      const {
        data: { publicUrl: pdfUrl },
      } = supabase.storage.from("books").getPublicUrl(pdfPath);
      const {
        data: { publicUrl: coverUrl },
      } = supabase.storage.from("covers").getPublicUrl(coverPath);

      // 4. Insert book record
      const { error: dbError } = await supabase.from("books").insert({
        user_id: user.id,
        book_title: title.trim(),
        pdf_url: pdfUrl,
        cover_url: coverUrl,
        bookmarked_page: 0,
      });

      if (dbError) throw new Error(`Database error: ${dbError.message}`);
      setProgress(100);

      toast({
        title: "Book uploaded!",
        description: `"${title.trim()}" has been added to your library.`,
        variant: "success",
      });

      reset();
      onSuccess();
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Upload a Book">
      <form onSubmit={handleUpload} className="space-y-5">
        {/* Book title */}
        <Input
          id="book-title"
          label="Book Title"
          type="text"
          placeholder="e.g. Project Hail Mary"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={uploading}
        />

        {/* PDF upload */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            PDF File
          </label>
          <div
            onClick={() => !uploading && pdfInputRef.current?.click()}
            className={`
              relative flex items-center gap-3 p-4 rounded-xl border-2 border-dashed
              cursor-pointer transition-all duration-200
              ${
                pdfFile
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/30 bg-input"
              }
              ${uploading ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            <FileText
              className={`w-8 h-8 flex-shrink-0 ${pdfFile ? "text-primary" : "text-muted"}`}
            />
            <div className="min-w-0 flex-1">
              {pdfFile ? (
                <>
                  <p className="text-sm font-medium text-foreground truncate">
                    {pdfFile.name}
                  </p>
                  <p className="text-xs text-muted">
                    {(pdfFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted">
                    Tap to select PDF
                  </p>
                  <p className="text-xs text-muted-foreground">.pdf files only</p>
                </>
              )}
            </div>
            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>
        </div>

        {/* Cover upload */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-gray-300">
            Cover Image
          </label>
          <div
            onClick={() => !uploading && coverInputRef.current?.click()}
            className={`
              relative flex items-center gap-3 p-4 rounded-xl border-2 border-dashed
              cursor-pointer transition-all duration-200
              ${
                coverFile
                  ? "border-primary/50 bg-primary/5"
                  : "border-border hover:border-primary/30 bg-input"
              }
              ${uploading ? "opacity-50 pointer-events-none" : ""}
            `}
          >
            <ImageIcon
              className={`w-8 h-8 flex-shrink-0 ${coverFile ? "text-primary" : "text-muted"}`}
            />
            <div className="min-w-0 flex-1">
              {coverFile ? (
                <>
                  <p className="text-sm font-medium text-foreground truncate">
                    {coverFile.name}
                  </p>
                  <p className="text-xs text-muted">
                    {(coverFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-muted">
                    Tap to select cover
                  </p>
                  <p className="text-xs text-muted-foreground">
                    .jpg or .png files
                  </p>
                </>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>
        </div>

        {/* Progress bar */}
        {uploading && (
          <div className="space-y-1">
            <div className="h-2 rounded-full bg-surface overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted text-center">
              Uploading... {progress}%
            </p>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full gap-2"
          disabled={uploading || !pdfFile || !coverFile || !title.trim()}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {uploading ? "Uploading..." : "Upload Book"}
        </Button>
      </form>
    </Dialog>
  );
}
