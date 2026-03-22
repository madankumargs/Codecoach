"use client";

// 📚 TOAST NOTIFICATION SYSTEM
// A lightweight, fully custom toast system — no external library needed.
// Usage: import { useToast } from "@/components/Toast"
//        const { toast } = useToast()
//        toast.success("Saved!")
//        toast.error("Something went wrong")

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

type ToastContextType = {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    warning: (msg: string) => void;
    info: (msg: string) => void;
  };
};

const ToastContext = createContext<ToastContextType | null>(null);

let counter = 0;

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: "border-green-500/40 bg-green-500/10 text-green-300",
  error: "border-red-500/40 bg-red-500/10 text-red-300",
  warning: "border-yellow-500/40 bg-yellow-500/10 text-yellow-300",
  info: "border-blue-500/40 bg-blue-500/10 text-blue-300",
};

const iconColors = {
  success: "text-green-400",
  error: "text-red-400",
  warning: "text-yellow-400",
  info: "text-blue-400",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const Icon = icons[toast.type];

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), 4000);
    return () => clearTimeout(t);
  }, [toast.id, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm shadow-xl
        max-w-sm w-full animate-fade-in ${colors[toast.type]}`}
      style={{ animation: "slideIn 0.25s ease-out" }}
    >
      <Icon size={16} className={`flex-shrink-0 ${iconColors[toast.type]}`} />
      <p className="text-sm flex-1 font-medium">{toast.message}</p>
      <button
        onClick={() => onRemove(toast.id)}
        className="text-current opacity-50 hover:opacity-100 transition-opacity"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const add = useCallback((message: string, type: ToastType) => {
    const id = ++counter;
    setToasts((prev) => [...prev.slice(-3), { id, message, type }]); // max 4 at a time
  }, []);

  const toast = {
    success: (msg: string) => add(msg, "success"),
    error: (msg: string) => add(msg, "error"),
    warning: (msg: string) => add(msg, "warning"),
    info: (msg: string) => add(msg, "info"),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {/* Toast container — fixed bottom-right */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
