import Link from "next/link";
import Header from "@/components/layout/Header";
import { Search, Home, ShoppingBag } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="flex items-center justify-center px-4 pt-32 pb-20">
        <div className="text-center max-w-lg space-y-8">
          {/* 404 Big Number */}
          <div className="relative">
            <h1 className="text-[10rem] sm:text-[12rem] font-black text-primary/5 leading-none select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 bg-secondary/10 rounded-full flex items-center justify-center">
                <Search size={48} className="text-secondary" />
              </div>
            </div>
          </div>

          {/* Title & Description */}
          <div className="space-y-3 -mt-8">
            <h2 className="text-3xl sm:text-4xl font-black text-foreground">
              الصفحة غير موجودة
            </h2>
            <p className="text-muted-foreground font-medium text-lg leading-relaxed max-w-md mx-auto">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها. تأكد من صحة الرابط أو عد للتصفح.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-4 rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/10"
            >
              <Home size={20} />
              الصفحة الرئيسية
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/10"
            >
              <ShoppingBag size={20} />
              تصفح المتجر
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
