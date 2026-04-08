"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  forwardRef,
} from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import {
  ChevronLeft,
  ChevronRight,
  Bookmark,
  ArrowLeft,
  Loader2,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/Toast";

// Set PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

interface FlipbookReaderProps {
  bookId: string;
  pdfUrl: string;
  bookmarkedPage: number;
  bookTitle: string;
  onBack: () => void;
}

/* react-pageflip requires forwardRef for each page */
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

export function FlipbookReader({
  bookId,
  pdfUrl,
  bookmarkedPage,
  bookTitle,
  onBack,
}: FlipbookReaderProps) {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saving, setSaving] = useState(false);
  const flipBookRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  // Responsive dimensions
  const [dimensions, setDimensions] = useState({ width: 350, height: 500 });

  const updateDimensions = useCallback(() => {
    const isMobile = window.innerWidth < 640;
    const maxW = isMobile
      ? window.innerWidth - 32
      : Math.min(window.innerWidth * 0.4, 500);
    const maxH = isMobile
      ? window.innerHeight - 160
      : window.innerHeight - 200;
    const ratio = 0.7; // portrait page ratio
    let w = maxW;
    let h = w / ratio;
    if (h > maxH) {
      h = maxH;
      w = h * ratio;
    }
    setDimensions({ width: Math.floor(w), height: Math.floor(h) });
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, [updateDimensions]);

  // Load PDF
  useEffect(() => {
    let cancelled = false;

    async function loadPdf() {
      try {
        const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
        const numPages = pdf.numPages;
        setTotalPages(numPages);
        const pageImages: string[] = [];

        for (let i = 1; i <= numPages; i++) {
          if (cancelled) return;
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 1.5 });
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d")!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
          pageImages.push(canvas.toDataURL("image/jpeg", 0.85));
          setLoadingProgress(Math.round((i / numPages) * 100));
        }

        if (!cancelled) {
          setPages(pageImages);
          setLoading(false);
        }
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

  // Auto-flip to bookmarked page after render
  useEffect(() => {
    if (!loading && bookmarkedPage > 0 && flipBookRef.current) {
      setTimeout(() => {
        flipBookRef.current?.pageFlip()?.flip(bookmarkedPage);
      }, 500);
    }
  }, [loading, bookmarkedPage]);

  // Save bookmark
  const saveBookmark = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("books")
        .update({ bookmarked_page: currentPage })
        .eq("id", bookId);

      if (error) throw error;

      toast({
        title: "Bookmark saved",
        description: `Page ${currentPage + 1} bookmarked.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Failed to save",
        description: "Could not save your bookmark.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Fullscreen toggle
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
      // Fullscreen not supported
    }
  };

  // Page navigation
  const prevPage = () => flipBookRef.current?.pageFlip()?.flipPrev();
  const nextPage = () => flipBookRef.current?.pageFlip()?.flipNext();

  const onFlip = (e: any) => {
    setCurrentPage(e.data);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60dvh] gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-sm text-muted mb-2">Loading PDF...</p>
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

  return (
    <div
      ref={containerRef}
      className={`flex flex-col items-center ${isFullscreen ? "bg-background p-4 justify-center min-h-screen" : ""}`}
    >
      {/* Top controls */}
      <div className="w-full flex items-center justify-between mb-4 px-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-1.5 text-muted hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>

        <h2 className="text-sm sm:text-base font-medium text-foreground truncate max-w-[40vw] sm:max-w-none text-center">
          {bookTitle}
        </h2>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="text-muted hover:text-foreground"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={saveBookmark}
            disabled={saving}
            className="text-muted hover:text-primary"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Bookmark className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Flipbook */}
      <div className="relative flex items-center justify-center">
        {/* Prev button — hidden on mobile (swipe instead) */}
        <button
          onClick={prevPage}
          className="hidden sm:flex absolute -left-12 z-10 w-10 h-10 rounded-full glass items-center justify-center text-muted hover:text-primary transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <HTMLFlipBook
          ref={flipBookRef}
          width={dimensions.width}
          height={dimensions.height}
          size="fixed"
          minWidth={200}
          maxWidth={600}
          minHeight={300}
          maxHeight={900}
          showCover={true}
          mobileScrollSupport={false}
          onFlip={onFlip}
          className="shadow-2xl shadow-black/50 rounded-lg overflow-hidden"
          style={{}}
          startPage={0}
          drawShadow={true}
          flippingTime={600}
          usePortrait={true}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.5}
          showPageCorners={true}
          disableFlipByClick={false}
          useMouseEvents={true}
          swipeDistance={30}
          clickEventForward={true}
          renderOnlyPageLengthChange={false}
        >
          {pages.map((src, idx) => (
            <PageComponent key={idx} number={idx}>
              <img
                src={src}
                alt={`Page ${idx + 1}`}
                className="w-full h-full object-contain"
                draggable={false}
              />
            </PageComponent>
          ))}
        </HTMLFlipBook>

        {/* Next button */}
        <button
          onClick={nextPage}
          className="hidden sm:flex absolute -right-12 z-10 w-10 h-10 rounded-full glass items-center justify-center text-muted hover:text-primary transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom controls — mobile friendly */}
      <div className="mt-4 flex items-center gap-4">
        {/* Mobile prev/next */}
        <button
          onClick={prevPage}
          className="sm:hidden w-10 h-10 rounded-full glass flex items-center justify-center text-muted active:text-primary transition-colors touch-manipulation"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <p className="text-sm text-muted">
            Page{" "}
            <span className="text-foreground font-medium">
              {currentPage + 1}
            </span>{" "}
            of {totalPages}
          </p>
        </div>

        <button
          onClick={nextPage}
          className="sm:hidden w-10 h-10 rounded-full glass flex items-center justify-center text-muted active:text-primary transition-colors touch-manipulation"
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile bookmark bar */}
      <div className="sm:hidden mt-4 w-full px-4">
        <Button
          onClick={saveBookmark}
          disabled={saving}
          className="w-full gap-2"
          size="md"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Bookmark className="w-4 h-4" />
          )}
          Save Bookmark
        </Button>
      </div>
    </div>
  );
}
