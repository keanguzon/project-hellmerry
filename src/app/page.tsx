import Link from "next/link";
import { Rocket, BookOpen, Bookmark } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-dvh flex flex-col items-center justify-center p-6 bg-transparent select-none pointer-events-none">
      
      {/* Centered Main Content Area */}
      <main className="flex flex-col items-center max-w-lg w-full z-10 pointer-events-auto">
        
        {/* Rocket Logo Box */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border sm:border-2 border-primary/40 flex items-center justify-center mb-8 sm:mb-10 shadow-[0_0_30px_rgba(236,72,153,0.15)] bg-black/20 backdrop-blur-sm">
          <Rocket className="w-10 h-10 sm:w-12 sm:h-12 text-primary drop-shadow-[0_0_10px_rgba(236,72,153,0.8)]" />
        </div>

        {/* Typography */}
        <div className="text-center mb-6 sm:mb-8 space-y-1">
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-none">
            PROJECT
          </h1>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-primary drop-shadow-[0_0_20px_rgba(236,72,153,0.8)] leading-none">
            HELLMERRY
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 font-medium mb-12 text-center text-balance max-w-sm">
          Your personal library, adrift among the stars.
        </p>

        {/* Enter Button */}
        <Link
          href="/dashboard"
          className="w-full sm:w-3/4 max-w-md py-4 rounded-2xl bg-primary text-primary-foreground font-semibold text-lg text-center transition-transform hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(236,72,153,0.4)]"
          draggable={false}
        >
          Enter the Library
        </Link>
      </main>

      {/* Bottom Icons Row */}
      <footer className="absolute bottom-10 left-0 w-full flex justify-center gap-16 sm:gap-24 px-6 z-10 pointer-events-auto text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary/80" />
          <span className="text-xs font-medium tracking-wide">Upload</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Rocket className="w-5 h-5 text-primary/80" />
          <span className="text-xs font-medium tracking-wide">Read</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Bookmark className="w-5 h-5 text-primary/80" />
          <span className="text-xs font-medium tracking-wide">Bookmark</span>
        </div>
      </footer>
    </div>
  );
}
