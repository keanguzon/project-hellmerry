"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { BookCard } from "@/components/BookCard";
import { UploadModal } from "@/components/UploadModal";
import { EditBookModal } from "@/components/EditBookModal";
import { Button } from "@/components/ui/Button";
import { Plus, BookOpen, Loader2, Search, CheckSquare, Trash2, X } from "lucide-react";
import type { Book } from "@/types/database";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editBook, setEditBook] = useState<Book | null>(null);
  
  // Search & Selection state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();
  const { toast } = useToast();

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

  const handleEditSuccess = () => {
    setEditBook(null);
    fetchBooks();
  };

  // Delete single or multiple
  const deleteBooks = async (ids: string[]) => {
    if (!confirm(`Are you sure you want to delete ${ids.length} book(s)?`)) return;
    
    setIsDeleting(true);
    try {
      const { error } = await supabase.from("books").delete().in("id", ids);
      if (error) throw error;
      
      toast({ title: "Books deleted successfully", variant: "success" });
      setSelectedBooks(new Set());
      setSelectionMode(false);
      fetchBooks();
    } catch (err: any) {
      toast({ title: "Failed to delete books", description: err.message, variant: "destructive" });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSelectBook = (id: string) => {
    const next = new Set(selectedBooks);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedBooks(next);
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedBooks(new Set());
  };

  // Filter books manually so it's instant client-side
  const filteredBooks = useMemo(() => {
    if (!searchQuery) return books;
    const lower = searchQuery.toLowerCase();
    return books.filter((b) => b.book_title.toLowerCase().includes(lower));
  }, [books, searchQuery]);

  return (
    <>
      <div className="flex flex-col gap-6 mb-8">
        {/* Header row */}
        <div className="flex items-start md:items-center justify-between flex-col md:flex-row gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-glow">
              My Bookshelf
            </h1>
            <p className="text-sm text-muted mt-1">
              {books.length} {books.length === 1 ? "book" : "books"} in your library
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative flex-1 md:w-64 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <input
                type="text"
                placeholder="Search books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl bg-input border border-border text-sm text-foreground focus:ring-1 focus:ring-primary focus:outline-none placeholder:text-muted truncate transition-all overflow-hidden"
              />
            </div>

            {/* Selection Mode Toggle */}
            {books.length > 0 && (
              <Button
                variant={selectionMode ? "primary" : "outline"}
                size="sm"
                onClick={toggleSelectionMode}
                className={`gap-2 whitespace-nowrap px-3 h-10 ${selectionMode ? 'bg-primary text-white' : ''}`}
              >
                {selectionMode ? <X className="w-4 h-4" /> : <CheckSquare className="w-4 h-4" />}
                <span className="hidden sm:inline">{selectionMode ? "Cancel" : "Select"}</span>
              </Button>
            )}

            {/* Upload button — desktop */}
            <Button
              onClick={() => setUploadOpen(true)}
              className="hidden sm:inline-flex gap-2 h-10 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              Upload Book
            </Button>
          </div>
        </div>
        
        {/* Floating Bulk Action Bar */}
        {selectionMode && selectedBooks.size > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/20 border border-primary/50 text-white animate-in slide-in-from-top-4 fade-in duration-300">
            <span className="text-sm font-medium px-2">{selectedBooks.size} selected</span>
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={() => deleteBooks(Array.from(selectedBooks))}
              disabled={isDeleting}
              className="gap-2 shrink-0 shadow-[0_0_15px_rgba(244,63,94,0.4)]"
            >
              {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Selected
            </Button>
          </div>
        )}
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
      ) : filteredBooks.length === 0 ? (
         <div className="flex flex-col items-center justify-center py-20 text-center text-muted">
            <Search className="w-12 h-12 mb-4 opacity-50" />
            <p>No books found matching &quot;{searchQuery}&quot;</p>
         </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredBooks.map((book) => (
            <BookCard 
              key={book.id} 
              book={book} 
              selectionMode={selectionMode}
              selected={selectedBooks.has(book.id)}
              onToggleSelect={toggleSelectBook}
              onEdit={setEditBook}
              onDelete={(id) => deleteBooks([id])}
            />
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

      {/* Modals */}
      <UploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onSuccess={handleUploadSuccess}
      />
      
      {editBook && (
        <EditBookModal
          book={editBook}
          open={!!editBook}
          onClose={() => setEditBook(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}
