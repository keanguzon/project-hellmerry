"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2,
  Trash2,
  Play,
  X,
  BookmarkPlus,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";
import type { BookmarkRecord } from "@/types/database";

/* ================================================================
   TYPES
   ================================================================ */

interface FlipbookReaderProps {
  bookId: string;
  pdfUrl: string;
  bookmarkedPage: number;
  bookTitle: string;
  onBack: () => void;
}

/* ================================================================
   PAGE COMPONENT (react-pageflip requires forwardRef)
   ================================================================ */

const PageComponent = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; number: number }
>(({ children, number }, ref) => (
  <div
    ref={ref}
    className="bg-white flex items-center justify-center overflow-hidden"
    data-page={number}
  >
    {children}
  </div>
));
PageComponent.displayName = "PageComponent";

/* ================================================================
   MAIN COMPONENT
   ================================================================ */

export function FlipbookReader({
  bookId,
  pdfUrl,
  bookmarkedPage,
  bookTitle,
  onBack,
}: FlipbookReaderProps) {
  /* ---------- state ---------- */
  const [rawPages, setRawPages] = useState<string[] | null>(null);
  const [displayPages, setDisplayPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Bookmarks
  const [bookmarks, setBookmarks] = useState<BookmarkRecord[]>([]);
  const [addingBookmark, setAddingBookmark] = useState(false);
  const [bookmarkNote, setBookmarkNote] = useState("");

  // User
  const [userId, setUserId] = useState("");

  // Zoom
  const zoom = 1.0; // Reset to 1.0 as requested

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: 350, height: 500 });

  // Add state to detect if we should force portrait
  const [forcePortrait, setForcePortrait] = useState(false);

  /* ---------- refs ---------- */
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentPageRef = useRef(0);
  const lastSavedPageRef = useRef(bookmarkedPage);

  const supabase = createClient();
  const { toast } = useToast();

  currentPageRef.current = currentPage;

  /* ---------- effects ---------- */

  // Get user ID
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
    });
  }, [supabase]);

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Dimensions — fill the screen
  useEffect(() => {
    function calc() {
      const toolbarH = 48;
      const bottomH = isMobile ? 0 : 40;
      const sideW = sidebarOpen && !isMobile ? 288 : 0;
      const padY = isMobile ? 16 : 32;
      const padX = isMobile ? 0 : 64; // Generous horizontal padding to ensure arrows fit

      const availH = window.innerHeight - toolbarH - bottomH - padY;
      const availW = window.innerWidth - sideW - padX;
      
      const ratio = 0.707; // A4 aspect ration (width / height)

      let pageH = availH;
      let pageW = pageH * ratio;

      if (isMobile) {
        if (pageW > availW) {
          pageW = availW;
          pageH = pageW / ratio;
        }
        setForcePortrait(true);
      } else {
        // Two pages side by side
        if (pageW * 2 > availW && zoom <= 1) {
          pageW = availW / 2;
          pageH = pageW / ratio;
        }
        setForcePortrait(false);
      }

      setDimensions({
        width: Math.floor(pageW * zoom),
        height: Math.floor(pageH * zoom),
      });
    }

    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [sidebarOpen, isMobile, zoom]);

  // Load PDF (from cache or render)
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        const { getCachedPages, cachePages } = await import("@/lib/pdfCache");
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const cacheKey = `${pdfUrl}_v3`;
        // Try cache first
        const cached = await getCachedPages(cacheKey);
        if (cached && cached.length > 0 && !cancelled) {
          setPdfPageCount(cached.length);
          // Pad to even for cover/back-cover
          const pages = [...cached];
          if (pages.length % 2 !== 0) {
            const blankCanvas = document.createElement("canvas");
            blankCanvas.width = 800;
            blankCanvas.height = 1131;
            const bCtx = blankCanvas.getContext("2d")!;
            bCtx.fillStyle = "#ffffff";
            bCtx.fillRect(0, 0, 800, 1131);
            pages.push(blankCanvas.toDataURL("image/jpeg", 0.9));
          }
          setTotalPages(pages.length);
          setRawPages(pages);
          setLoadingProgress(100);
          return;
        }

        // Render from PDF
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const numPages = pdf.numPages;
        setPdfPageCount(numPages);
        const pageImages: string[] = [];
        let firstW = 800,
          firstH = 1131;

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const baseVp = page.getViewport({ scale: 1 });
          if (i === 1) {
            firstW = baseVp.width;
            firstH = baseVp.height;
          }
          
          const targetH = 1600; // High resolution target
          const scale = Math.min(targetH / baseVp.height, 4);
          
          const viewport = page.getViewport({ scale });
          
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await page.render({ canvasContext: ctx, viewport } as any).promise;

          pageImages.push(canvas.toDataURL("image/jpeg", 0.85));
          setLoadingProgress(Math.round((i / numPages) * 100));
        }

        if (cancelled) return;

        // Cache the raw pages (cacheKey declared at top of try block)
        cachePages(cacheKey, pageImages).catch(() => {});

        // Pad to even
        if (pageImages.length % 2 !== 0) {
          const bc = document.createElement("canvas");
          bc.width = Math.round(firstW * (1400 / firstH));
          bc.height = 1400;
          const bCtx = bc.getContext("2d")!;
          bCtx.fillStyle = "#ffffff";
          bCtx.fillRect(0, 0, bc.width, bc.height);
          pageImages.push(bc.toDataURL("image/jpeg", 0.9));
        }

        setTotalPages(pageImages.length);
        setRawPages(pageImages);
      } catch (err) {
        console.error("Failed to load PDF:", err);
        toast({
          title: "Failed to load PDF",
          description: "The PDF file could not be parsed.",
          variant: "destructive",
        });
      }
    }

    loadPdf();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, toast]);

  // Load bookmarks from DB
  useEffect(() => {
    if (!userId || !bookId) return;
    supabase
      .from("bookmarks")
      .select("*")
      .eq("book_id", bookId)
      .eq("user_id", userId)
      .order("page", { ascending: true })
      .then(({ data }) => {
        if (data) setBookmarks(data as BookmarkRecord[]);
      });
  }, [userId, bookId, supabase]);

  // Set initial display pages
  useEffect(() => {
    if (rawPages) {
      setDisplayPages(rawPages);
      setLoading(false);
    }
  }, [rawPages]);

  // Auto-flip to last opened page
  useEffect(() => {
    if (!loading && bookmarkedPage > 0 && flipBookRef.current) {
      setTimeout(() => {
        flipBookRef.current?.pageFlip()?.flip(bookmarkedPage);
      }, 400);
    }
  }, [loading, bookmarkedPage]);

  // Debounced auto-save of last opened page
  useEffect(() => {
    if (currentPage === lastSavedPageRef.current || !bookId) return;
    const timer = setTimeout(async () => {
      try {
        await supabase
          .from("books")
          .update({ bookmarked_page: currentPage })
          .eq("id", bookId);
        lastSavedPageRef.current = currentPage;
      } catch {
        /* silent */
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [currentPage, bookId, supabase]);

  // Save on unmount
  useEffect(() => {
    return () => {
      if (currentPageRef.current !== lastSavedPageRef.current) {
        supabase
          .from("books")
          .update({ bookmarked_page: currentPageRef.current })
          .eq("id", bookId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  /* ---------- bookmark handlers ---------- */

  const handleAddBookmark = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("bookmarks")
        .upsert(
          {
            book_id: bookId,
            user_id: userId,
            page: currentPage,
            note: bookmarkNote.trim() || null,
          },
          { onConflict: "book_id,user_id,page" }
        )
        .select()
        .single();

      if (error) throw error;

      setBookmarks((prev) => {
        const filtered = prev.filter((b) => b.page !== currentPage);
        return [...filtered, data as BookmarkRecord].sort(
          (a, b) => a.page - b.page
        );
      });
      setAddingBookmark(false);
      setBookmarkNote("");
      toast({
        title: "Bookmark saved",
        description: `Page ${currentPage + 1} bookmarked.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to save",
        description: "Could not save bookmark.",
        variant: "destructive",
      });
    }
  };

  const deleteBookmark = async (id: string) => {
    try {
      await supabase.from("bookmarks").delete().eq("id", id);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
    } catch {
      toast({
        title: "Error",
        description: "Could not delete bookmark.",
        variant: "destructive",
      });
    }
  };

  const jumpToPage = (page: number) => {
    flipBookRef.current?.pageFlip()?.flip(page);
    if (isMobile) setSidebarOpen(false);
  };

  /* ---------- navigation ---------- */

  const prevPage = () => flipBookRef.current?.pageFlip()?.flipPrev();
  const nextPage = () => flipBookRef.current?.pageFlip()?.flipNext();
  const onFlip = (e: any) => setCurrentPage(e.data);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      /* not supported */
    }
  };

  /* ---------- loading screen ---------- */

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-sm text-muted mb-2">Loading book…</p>
          <div className="w-48 h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300 shadow-[0_0_10px_rgba(236,72,153,0.5)]"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted mt-1">{loadingProgress}%</p>
        </div>
      </div>
    );
  }

  /* ---------- main render ---------- */

  return (
    <div
      ref={containerRef}
      className={`flex h-full overflow-hidden relative ${isFullscreen || isMobile ? "bg-background" : ""}`}
    >
      {/* Mobile sidebar backdrop (transparent to allow toggling off) */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ============ SIDEBAR / DROPDOWN ============ */}
      <aside
        className={`
          ${isMobile 
            ? `absolute top-12 right-2 max-w-[300px] w-[calc(100vw-16px)] rounded-xl shadow-2xl glass-strong border border-border z-40 transition-all origin-top-right ${sidebarOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"}` 
            : `${sidebarOpen ? "w-72 border-r translate-x-0" : "w-0 border-r-0 -translate-x-full md:translate-x-0"} relative z-40 h-full glass-strong border-border transition-all duration-300 ease-in-out`
          }
          flex flex-col shrink-0 overflow-hidden whitespace-nowrap ${isMobile ? 'max-h-[60vh] h-auto' : 'h-full'}
        `}
      >
        <div className="w-full sm:w-72 flex flex-col h-full items-stretch">
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground">
              Reading Tools
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Last Opened */}
          <div className="px-4 py-3 border-b border-border shrink-0">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              Last Opened
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-sm text-foreground">
                Page {bookmarkedPage + 1}
              </span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => jumpToPage(bookmarkedPage)}
                className="gap-1 text-xs text-primary hover:text-primary"
              >
                <Play className="w-3 h-3" /> Resume
              </Button>
            </div>
          </div>

          {/* Bookmarks list */}
          <div className="flex-1 overflow-y-auto px-4 py-3 min-h-0">
            <h3 className="text-[10px] font-semibold text-muted uppercase tracking-widest mb-2">
              Bookmarks
            </h3>

            {bookmarks.length === 0 ? (
              <p className="text-xs text-muted italic">No bookmarks yet</p>
            ) : (
              <div className="space-y-1.5">
                {bookmarks.map((bm) => (
                  <div
                    key={bm.id}
                    className="group flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <span className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded mt-0.5">
                      Pg {bm.page + 1}
                    </span>
                    <span className="flex-1 text-xs text-foreground/80 line-clamp-2 leading-relaxed">
                      {bm.note || `Page ${bm.page + 1}`}
                    </span>
                    <div className="shrink-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => jumpToPage(bm.page)}
                        className="text-muted hover:text-primary transition-colors p-0.5"
                        title="Jump to page"
                      >
                        <Play className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteBookmark(bm.id)}
                        className="text-muted hover:text-red-400 transition-colors p-0.5"
                        title="Delete bookmark"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Bookmark */}
          <div className="px-4 py-3 border-t border-border shrink-0">
            {addingBookmark ? (
              <div className="space-y-2">
                <p className="text-xs text-muted">
                  Bookmark page{" "}
                  <span className="text-foreground font-medium">
                    {currentPage + 1}
                  </span>
                </p>
                <textarea
                  value={bookmarkNote}
                  onChange={(e) => setBookmarkNote(e.target.value)}
                  placeholder="Add a note (optional)"
                  className="w-full h-16 p-2 text-xs rounded-md bg-input border border-border text-foreground placeholder:text-muted-foreground resize-none focus:ring-1 focus:ring-primary/50 focus:outline-none"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleAddBookmark}
                    className="flex-1 text-xs"
                  >
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setAddingBookmark(false);
                      setBookmarkNote("");
                    }}
                    className="text-xs"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAddingBookmark(true)}
                className="w-full gap-1 text-xs"
              >
                <BookmarkPlus className="w-3.5 h-3.5" /> Add Bookmark
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* ============ MAIN CONTENT ============ */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-2 sm:px-3 py-2 shrink-0 h-12 z-20">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden sm:flex text-muted hover:text-foreground"
              title="Reading tools"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeftOpen className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1 text-muted hover:text-foreground px-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline text-xs">Back</span>
            </Button>
          </div>

          <h2 className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[25vw] sm:max-w-[40vw]">
            {bookTitle}
          </h2>

          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                if (!sidebarOpen) setAddingBookmark(true);
                setSidebarOpen(!sidebarOpen);
              }}
              className={`hover:text-primary mr-1 ${sidebarOpen ? 'text-primary bg-primary/10' : 'text-muted'}`}
              title="Bookmarks"
            >
              <BookmarkPlus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-muted hover:text-foreground"
              title="Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Book area */}
        <div className="flex-1 w-full flex items-center justify-center overflow-hidden relative">
          <div className="flex items-center justify-center w-full h-full">
            {/* Prev nav (desktop only) */}
            <button
              onClick={prevPage}
              className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 shrink-0 w-10 h-10 rounded-full glass items-center justify-center text-muted hover:text-primary transition-colors z-20"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Flipbook wrapper */}
            {/* margin: auto and overflow-visible ensures natural sizing inside the flex container */}
            <div 
              className="relative shrink-0 flex items-center justify-center"
              style={{ 
                width: forcePortrait ? dimensions.width : dimensions.width * 2, 
                height: dimensions.height 
              }}
            >
            <HTMLFlipBook
              ref={flipBookRef}
              width={dimensions.width}
              height={dimensions.height}
              size="fixed"
              minWidth={200}
              maxWidth={1500}
              minHeight={300}
              maxHeight={2000}
              showCover={true}
              mobileScrollSupport={false}
              onFlip={onFlip}
              className="shadow-2xl shadow-black/80 rounded-sm"
              style={{}}
              startPage={0}
              drawShadow={true}
              flippingTime={600}
              usePortrait={forcePortrait}
              startZIndex={0}
              autoSize={false}
              maxShadowOpacity={0.6}
              showPageCorners={true}
              disableFlipByClick={false}
              useMouseEvents={true}
              swipeDistance={30}
              clickEventForward={false}
              renderOnlyPageLengthChange={false}
            >
              {displayPages.map((src, idx) => (
                <PageComponent key={idx} number={idx}>
                  <img
                    src={src}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-full object-contain pointer-events-none select-none"
                    draggable={false}
                  />
                </PageComponent>
              ))}
            </HTMLFlipBook>

          </div>

            {/* Next nav (desktop only) */}
            <button
              onClick={nextPage}
              className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 shrink-0 w-10 h-10 rounded-full glass items-center justify-center text-muted hover:text-primary transition-colors z-20"
              aria-label="Next page"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Bottom bar (desktop only) */}
        <div className="hidden sm:flex items-center justify-center gap-4 py-2 shrink-0">
          <p className="text-xs text-muted">
            Page{" "}
            <span className="text-foreground font-medium">
              {Math.min(currentPage + 1, pdfPageCount)}
            </span>{" "}
            of {pdfPageCount}
          </p>
        </div>

        {/* Mobile Page Badge Overlay */}
        <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <div className="glass px-3 py-1.5 rounded-full text-[10px] text-muted-foreground shadow-lg backdrop-blur-md bg-black/40 border border-white/10">
            {Math.min(currentPage + 1, pdfPageCount)} / {pdfPageCount}
          </div>
        </div>
      </div>
    </div>
  );
}
