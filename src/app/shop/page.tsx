"use client";

import { useState, useMemo, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import { ChevronDown, SlidersHorizontal, SearchX, Loader2 } from "lucide-react";
import { getProducts } from "@/lib/db/products";
import { Product } from "@/types/models/product";

function ShopContent() {
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("ترتيب حسب: الأحدث");
  
  const sortOptions = ["ترتيب حسب: الأحدث", "السعر: من الأقل للأعلى", "السعر: من الأعلى للأقل", "الأعلى تقييماً"];

  // Fetch products from Firestore
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
      setLoading(false);
    }
    loadProducts();
  }, []);

  // Filter by search query
  const filteredProducts = useMemo(() => {
    if (!queryParam.trim()) return products;
    const q = queryParam.trim().toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [queryParam, products]);

  // Sort the filtered products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (selectedSort) {
      case "السعر: من الأقل للأعلى":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "السعر: من الأعلى للأقل":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "الأعلى تقييماً":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      default:
        // Sort by 'isNew' or just use the order from DB
        sorted.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }
    return sorted;
  }, [filteredProducts, selectedSort]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-10 sm:mb-16 border-b border-border pb-6 sm:pb-10"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-3 sm:mb-4">
            {queryParam ? `نتائج البحث` : "المتجر التقني"}
          </h1>
          {queryParam ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <p className="text-base sm:text-lg text-muted-foreground font-medium">
                عرض النتائج لـ &quot;{queryParam}&quot; — {sortedProducts.length} منتج
              </p>
              <a href="/shop" className="text-sm font-bold text-secondary hover:underline underline-offset-4">
                مسح البحث
              </a>
            </div>
          ) : (
            <p className="text-base sm:text-lg text-muted-foreground font-medium max-w-2xl">
              تصفح التشكيلة الكاملة من أزياء متجر سطر. مصممة بدقة للمبرمجين وطلبة تكنولوجيا المعلومات.
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-4 relative z-30">
          <div className="relative w-full">
            <motion.button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between gap-2 sm:gap-3 w-full sm:w-[280px] bg-white/40 backdrop-blur-xl border border-primary/10 rounded-xl sm:rounded-[1.25rem] px-4 sm:px-5 py-3 sm:py-4 text-sm font-bold text-primary shadow-sm hover:bg-white/60 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <span>{selectedSort}</span>
              </div>
              <motion.div animate={{ rotate: isSortOpen ? 180 : 0 }}>
                <ChevronDown size={18} />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {isSortOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  transition={{ duration: 0.2, type: "spring", stiffness: 300, damping: 25 }}
                  className="absolute top-full mt-3 w-full bg-white/70 backdrop-blur-2xl border border-primary/5 rounded-[1.25rem] p-2 shadow-[0_15px_40px_-5px_rgba(22,54,68,0.15)] overflow-hidden"
                >
                  {sortOptions.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => { setSelectedSort(opt); setIsSortOpen(false); }}
                      className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                        selectedSort === opt 
                          ? 'bg-primary text-background shadow-md translate-x-[-4px]' 
                          : 'text-primary hover:bg-primary/5 hover:translate-x-[-4px]'
                      } mb-1 last:mb-0`}
                    >
                      {opt}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {sortedProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
          {sortedProducts.map((prod, idx) => (
            <ProductCard key={prod.id} product={prod} index={idx} />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20 space-y-4"
        >
          <div className="w-24 h-24 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
            <SearchX size={40} className="text-muted-foreground/40" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">لا توجد نتائج</h2>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">
            {products.length === 0 ? "قاعدة البيانات فارغة حالياً. يرجى تشغيل سكربت الرفع." : `لم نجد أي منتج يطابق بحثك "${queryParam}". جرب البحث بكلمات مختلفة.`}
          </p>
          <a href="/shop" className="inline-block mt-4 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-[#22556d] transition-colors">
            عرض كل المنتجات
          </a>
        </motion.div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20 relative">
      <Header />
      
      {/* Background decorative element */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[100px] -z-10" />

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-primary/5 rounded-2xl w-48" />
            <div className="h-6 bg-primary/5 rounded-xl w-96" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="aspect-[4/5] bg-primary/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      }>
        <ShopContent />
      </Suspense>
    </div>
  );
}
