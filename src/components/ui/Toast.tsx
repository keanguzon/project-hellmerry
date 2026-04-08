"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";
import { X } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────── */
type ToastVariant = "default" | "destructive" | "success";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  toast: (opts: Omit<Toast, "id">) => void;
}

/* ── Context ────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/* ── Provider ───────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback((opts: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...opts, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — bottom of screen on mobile */}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto sm:w-96 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Toast Item ─────────────────────────────────────────────── */
const variantStyles: Record<ToastVariant, string> = {
  default: "border-border",
  destructive: "border-destructive/50 bg-destructive/10",
  success: "border-green-500/50 bg-green-500/10",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: () => void;
}) {
  return (
    <div
      className={`
        pointer-events-auto glass rounded-xl p-4 pr-10
        border animate-fade-up
        ${variantStyles[toast.variant || "default"]}
      `}
    >
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 text-muted hover:text-foreground transition-colors touch-manipulation"
        aria-label="Dismiss"
      >
        <X className="w-4 h-4" />
      </button>
      <p className="text-sm font-medium text-foreground">{toast.title}</p>
      {toast.description && (
        <p className="text-xs text-muted mt-1">{toast.description}</p>
      )}
    </div>
  );
}
