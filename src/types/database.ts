export interface Book {
  id: string;
  user_id: string;
  book_title: string;
  pdf_url: string;
  cover_url: string;
  bookmarked_page: number;
  created_at: string;
  updated_at: string;
}

export interface BookmarkRecord {
  id: string;
  book_id: string;
  user_id: string;
  page: number;
  note: string | null;
  created_at: string;
}

export interface Stroke {
  points: [number, number][];
  color: string;
  width: number;
}

export interface HighlightRecord {
  id: string;
  book_id: string;
  user_id: string;
  page: number;
  strokes: Stroke[];
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      books: {
        Row: Book;
        Insert: Omit<Book, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Book, "id" | "created_at" | "updated_at">>;
      };
      bookmarks: {
        Row: BookmarkRecord;
        Insert: Omit<BookmarkRecord, "id" | "created_at">;
        Update: Partial<Omit<BookmarkRecord, "id" | "created_at">>;
      };
      highlights: {
        Row: HighlightRecord;
        Insert: Omit<HighlightRecord, "id" | "created_at" | "updated_at">;
        Update: Partial<
          Omit<HighlightRecord, "id" | "created_at" | "updated_at">
        >;
      };
    };
  };
}
