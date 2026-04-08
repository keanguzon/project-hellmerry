"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark } from "lucide-react";
import type { Book } from "@/types/database";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link
      href={`/book/${book.id}`}
      className="group block touch-manipulation"
    >
      <div className="relative rounded-xl overflow-hidden glass transition-all duration-300 hover:border-glow-strong hover:scale-[1.03] active:scale-[0.98]">
        {/* Cover Image */}
        <div className="relative aspect-[2/3] w-full overflow-hidden bg-surface">
          <Image
            src={book.cover_url}
            alt={book.book_title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
            <span className="text-sm font-medium text-primary drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">
              Read →
            </span>
          </div>

          {/* Bookmark indicator */}
          {book.bookmarked_page > 0 && (
            <div className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-primary/90 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.5)]">
              <Bookmark className="w-3.5 h-3.5 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Title */}
        <div className="p-3">
          <h3 className="text-sm font-medium text-foreground truncate">
            {book.book_title}
          </h3>
          {book.bookmarked_page > 0 && (
            <p className="text-xs text-muted mt-0.5">
              Page {book.bookmarked_page}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
