"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { FlipbookReader } from "@/components/FlipbookReader";
import { Loader2 } from "lucide-react";
import type { Book } from "@/types/database";
import Galaxy from "@/components/Galaxy";

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
        <Loader2 className="relative z-10 w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="relative min-h-dvh flex flex-col items-center justify-center gap-4">
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
    <div className="relative min-h-dvh">
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
      <div className="relative z-10 px-4 sm:px-6 py-4 sm:py-6 max-w-5xl mx-auto safe-top safe-bottom">
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
