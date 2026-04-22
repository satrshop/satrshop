"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body style={{ 
        margin: 0, 
        fontFamily: "system-ui, sans-serif",
        backgroundColor: "#ffe9c5",
        color: "#2C6A87",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1rem",
      }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          {/* Icon */}
          <div style={{
            width: "80px",
            height: "80px",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            fontSize: "2.5rem",
          }}>
            ⚠️
          </div>

          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, marginBottom: "0.75rem" }}>
            حدث خطأ في النظام
          </h1>

          <p style={{ color: "#5a8ba1", marginBottom: "1.5rem", lineHeight: 1.7 }}>
            عذراً، حدث خطأ غير متوقع في النظام. يرجى المحاولة مرة أخرى.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                backgroundColor: "#2C6A87",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              إعادة المحاولة
            </button>
            <a
              href="/"
              style={{
                backgroundColor: "#CA9837",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.75rem",
                fontWeight: 700,
                fontSize: "1rem",
                textDecoration: "none",
                display: "inline-block",
              }}
            >
              الصفحة الرئيسية
            </a>
          </div>

          {error?.digest && (
            <p style={{ fontSize: "0.7rem", color: "#5a8ba1", marginTop: "2rem", fontFamily: "monospace" }}>
              Error ID: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
