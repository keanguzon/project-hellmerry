"use client";

import { ToastProvider } from "@/components/ui/Toast";

export function Toaster({ children }: { children?: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
