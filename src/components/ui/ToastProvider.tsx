"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, AlertTriangle } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => {
      // إزالة الإشعار القديم إذا كان نفس النص (لمنع التكرار)
      const filtered = prev.filter(t => t.message !== message);
      // الاحتفاظ بآخر 3 إشعارات فقط كحد أقصى
      return [...filtered.slice(-2), { id, message, type }];
    });

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000); // إخفاء بعد 3 ثواني
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] flex flex-col-reverse items-center gap-3 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-xl border border-white/10 ${
                toast.type === "success" ? "bg-[#1e293b]/90 shadow-secondary/10" :
                toast.type === "error" ? "bg-[#1e293b]/90 shadow-red-500/10" :
                "bg-[#1e293b]/90"
              }`}
              dir="rtl"
            >
              <div className={`p-1.5 rounded-full ${
                toast.type === "success" ? "bg-secondary/20 text-secondary" :
                toast.type === "error" ? "bg-red-500/20 text-red-500" :
                "bg-blue-500/20 text-blue-500"
              }`}>
                {toast.type === "success" && <CheckCircle2 size={18} />}
                {toast.type === "error" && <XCircle size={18} />}
                {toast.type === "warning" && <AlertTriangle size={18} />}
                {toast.type === "info" && <Info size={18} />}
              </div>
              
              <span className="font-bold text-sm text-white">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
