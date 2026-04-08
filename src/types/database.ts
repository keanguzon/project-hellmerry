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

export interface Database {
  public: {
    Tables: {
      books: {
        Row: Book;
        Insert: Omit<Book, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Book, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
