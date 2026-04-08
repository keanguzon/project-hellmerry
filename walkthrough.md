# Project Hellmerry — Build Walkthrough

## What Was Built

A full-stack personal ebook library and reader web application with a "Petrova Line" pink neon sci-fi theme.

---

## File Structure Created

```
project-hellmerry/
├── public/
│   └── pdf.worker.min.mjs              # pdfjs worker (auto-copied via postinstall)
├── src/
│   ├── app/
│   │   ├── globals.css                  # Petrova Line theme, glassmorphism, glow utilities
│   │   ├── layout.tsx                   # Root layout (Geist fonts, ToastProvider)
│   │   ├── page.tsx                     # 🚀 Cinematic landing page with Galaxy
│   │   ├── login/page.tsx               # 🔑 Email/Password + Google/Facebook OAuth
│   │   ├── register/page.tsx            # 📝 Registration with password confirm
│   │   ├── auth/callback/route.ts       # 🔄 OAuth callback handler
│   │   ├── dashboard/
│   │   │   ├── layout.tsx               # Sticky nav bar, Galaxy bg, logout
│   │   │   └── page.tsx                 # 📚 Bookshelf grid + upload FAB
│   │   └── book/[id]/page.tsx           # 📖 Reader page (fetches book, renders flipbook)
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx               # Pink glow primary, outline, ghost, destructive
│   │   │   ├── Input.tsx                # Dark input with pink focus ring (16px for mobile)
│   │   │   ├── Card.tsx                 # Glassmorphism panel with optional glow
│   │   │   ├── Dialog.tsx               # Modal with backdrop blur, scroll lock
│   │   │   └── Toast.tsx                # Toast system with context provider
│   │   ├── Galaxy.tsx                   # Animated canvas starfield (placeholder)
│   │   ├── BookCard.tsx                 # Book cover card with hover glow
│   │   ├── UploadModal.tsx              # PDF + cover upload with progress bar
│   │   ├── FlipbookReader.tsx           # PDF.js → react-pageflip reader
│   │   └── Toaster.tsx                  # Toast context wrapper
│   ├── lib/supabase/
│   │   ├── client.ts                    # Browser client (@supabase/ssr)
│   │   ├── server.ts                    # Server client (async cookies)
│   │   └── middleware.ts                # Middleware client (session refresh)
│   ├── types/database.ts                # Book type + Database interface
│   └── middleware.ts                     # Route protection (/dashboard, /book)
├── supabase/schema.sql                   # Books table, RLS, storage buckets
├── .env.local.example                    # Supabase URL + anon key template
├── next.config.ts                        # Turbopack config, Supabase image domains
├── postcss.config.mjs                    # @tailwindcss/postcss
└── package.json                          # Includes postinstall for PDF worker
```

---

## Mobile-First Design Decisions

| Decision | Implementation |
|----------|---------------|
| **No input zoom on iOS** | All inputs use `text-base` (16px) |
| **Touch targets** | All buttons have `touch-manipulation`, min 44px tap areas |
| **Safe areas** | `safe-top` and `safe-bottom` utilities with `env(safe-area-inset-*)` |
| **Viewport units** | `min-h-dvh` everywhere (dynamic viewport height) |
| **Responsive grid** | Book grid: 2 cols mobile → 6 cols desktop |
| **Mobile FAB** | Floating upload button on mobile, inline button on desktop |
| **Mobile reader controls** | Bottom prev/next buttons + full-width bookmark bar on mobile |
| **Scrollbar** | Custom thin pink scrollbar, transparent track |
| **Tap highlight** | Disabled with `-webkit-tap-highlight-color: transparent` |

---

## Build Verification

- ✅ **TypeScript compilation** — passed
- ✅ **Tailwind CSS** — all utilities compiled
- ⚠️ **Static generation** — fails as expected (needs `.env.local` with Supabase credentials)

---

## Next Steps to Run

1. **Create `.env.local`** from the template:
   ```bash
   cp .env.local.example .env.local
   ```
   Fill in your Supabase project URL and anon key.

2. **Run the SQL schema** in your Supabase SQL Editor:
   - Open [supabase/schema.sql](file:///c:/Users/bibliyuh/Documents/code/project-hellmerry/supabase/schema.sql) and paste it.

3. **Configure OAuth providers** (optional) in Supabase Dashboard → Authentication → Providers.

4. **Replace Galaxy component** (optional) — swap [Galaxy.tsx](file:///c:/Users/bibliyuh/Documents/code/project-hellmerry/src/components/Galaxy.tsx) with the real React Bits component when ready.

5. **Start development:**
   ```bash
   npm run dev
   ```
