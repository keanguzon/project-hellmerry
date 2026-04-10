"use client";

import Image from "next/image";
import Link from "next/link";
import { Bookmark, Edit3, Trash2, CheckCircle2 } from "lucide-react";
import type { Book } from "@/types/database";

interface BookCardProps {
  book: Book;
  selectionMode?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEdit?: (book: Book) => void;
  onDelete?: (id: string, e: React.MouseEvent) => void;
}

export function BookCard({ 
  book, 
  selectionMode = false,
  selected = false,
  onToggleSelect,
  onEdit,
  onDelete
}: BookCardProps) {
  const content = (
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

          {/* Selection indicator */}
          {selectionMode && selected && (
            <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center transition-all">
              <CheckCircle2 className="w-12 h-12 text-primary drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
            </div>
          )}

          {/* Hover overlay (only if not in selection mode) */}
          {!selectionMode && (
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
              <div className="flex justify-end gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onEdit?.(book);
                  }}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:text-primary transition-colors hover:scale-110"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onDelete?.(book.id, e);
                  }}
                  className="w-8 h-8 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:text-red-400 transition-colors hover:scale-110"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-end justify-center pb-3">
                <span className="text-sm font-medium text-primary drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]">
                  Read →
                </span>
              </div>
            </div>
          )}

          {/* Bookmark indicator */}
          {book.bookmarked_page > 0 && (
            <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-primary/90 flex items-center justify-center shadow-[0_0_10px_rgba(236,72,153,0.5)]">
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
    );

  if (selectionMode) {
    return (
      <div 
        onClick={() => onToggleSelect?.(book.id)}
        className={`group block touch-manipulation cursor-pointer border-2 rounded-xl transition-all ${selected ? 'border-primary shadow-[0_0_20px_rgba(236,72,153,0.3)]' : 'border-transparent'}`}
      >
        {content}
      </div>
    );
  }

  return (
    <Link
      href={`/book/${book.id}`}
      className="group block touch-manipulation border-2 border-transparent"
    >
      {content}
    </Link>
  );
}
