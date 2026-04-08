"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookCard } from "@/components/BookCard";
import { UploadModal } from "@/components/UploadModal";
import { Button } from "@/components/ui/Button";
import { Plus, BookOpen, Loader2 } from "lucide-react";
import type { Book } from "@/types/database";

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const supabase = createClient();

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setBooks(data as Book[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleUploadSuccess = () => {
    setUploadOpen(false);
    fetchBooks();
  };

  return (
    <>
      {/* Header row */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-glow">
            My Bookshelf
          </h1>
          <p className="text-sm text-muted mt-1">
            {books.length} {books.length === 1 ? "book" : "books"} in your
            library
          </p>
        </div>

        {/* Upload button — desktop */}
        <Button
          onClick={() => setUploadOpen(true)}
          className="hidden sm:inline-flex gap-2"
        >
          <Plus className="w-4 h-4" />
          Upload Book
        </Button>
      </div>

      {/* Book Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : books.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 animate-float">
            <BookOpen className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No books yet</h2>
          <p className="text-muted text-sm max-w-xs mb-6">
            Upload your first ebook to start building your interstellar library.
          </p>
          <Button onClick={() => setUploadOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Upload Your First Book
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setUploadOpen(true)}
        className="sm:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-[0_0_20px_rgba(236,72,153,0.5)] flex items-center justify-center active:scale-95 transition-transform touch-manipulation safe-bottom"
        aria-label="Upload book"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Upload Modal */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
    </>
  );
}
