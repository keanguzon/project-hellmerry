"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FlipbookReader } from "@/components/FlipbookReader";
import { Loader2 } from "lucide-react";
import type { Book } from "@/types/database";

export default function BookReaderPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bookId = params.id as string;

  useEffect(() => {
    async function fetchBook() {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("id", bookId)
        .single();

      if (error || !data) {
        setError("Book not found");
      } else {
        setBook(data as Book);
      }
      setLoading(false);
    }

    if (bookId) fetchBook();
  }, [bookId, supabase]);

  if (loading) {
    return (
      <div className="relative min-h-dvh flex items-center justify-center">
        <Loader2 className="relative z-10 w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="relative min-h-dvh flex flex-col items-center justify-center gap-4">
        <div className="relative z-10 text-center">
          <p className="text-lg text-destructive mb-4">{error || "Book not found"}</p>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-primary hover:underline touch-manipulation"
          >
            ← Back to library
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-dvh">
      <div className="relative z-10 h-full">
        <FlipbookReader
          bookId={book.id}
          pdfUrl={book.pdf_url}
          bookmarkedPage={book.bookmarked_page}
          bookTitle={book.book_title}
          onBack={() => router.push("/dashboard")}
        />
      </div>
    </div>
  );
}
