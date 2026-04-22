"use client";

import { useEffect } from "react";
import { RefreshCw, Home, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-md space-y-6">
        {/* Icon */}
        <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle size={48} className="text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-black text-foreground">
          حدث خطأ غير متوقع
        </h1>

        {/* Description */}
        <p className="text-muted-foreground font-medium leading-relaxed">
          عذراً، حدث خطأ أثناء تحميل الصفحة. يرجى المحاولة مرة أخرى أو العودة للصفحة الرئيسية.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg"
          >
            <RefreshCw size={18} />
            إعادة المحاولة
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-secondary text-white px-6 py-3 rounded-xl font-bold hover:bg-secondary/90 transition-all shadow-lg"
          >
            <Home size={18} />
            الصفحة الرئيسية
          </a>
        </div>

        {/* Error digest for debugging */}
        {error?.digest && (
          <p className="text-xs text-muted-foreground/50 font-mono pt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
