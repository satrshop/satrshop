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
  const categoryParam = searchParams.get("category") || "all";

  const categories = [
    { id: "all", name: "الكل" },
    { id: "stickers", name: "الستيكرز" },
    { id: "accessories", name: "الإكسسوارات" },
    { id: "agenda", name: "الأجندة" },
  ];

  const [activeCategory, setActiveCategory] = useState(categoryParam);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState(categories.find(c => c.id === activeCategory)?.name || "كل المنتجات");

  const sortOptions = categories.map(c => c.name);

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

  // Sync active category with URL param
  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  // Filter by search query and category
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by Category
    if (activeCategory !== "all") {
      filtered = filtered.filter(p => {
        const cat = p.category?.toLowerCase() || "";
        const target = activeCategory.toLowerCase();
        // Match by internal ID or the specific names
        if (target === "stickers") return cat.includes("stickers") || cat.includes("ستيكر") || cat.includes("ستكر");
        if (target === "accessories") return cat.includes("accessories") || cat.includes("إكسسوار") || cat.includes("اكسسوار");
        if (target === "agenda") return cat.includes("agenda") || cat.includes("أجندة") || cat.includes("اجنده");
        return cat.includes(target);
      });
    }

    // Filter by Search Query
    if (queryParam.trim()) {
      const q = queryParam.trim().toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.category?.toLowerCase() || "").includes(q)
      );
    }

    return filtered;
  }, [queryParam, activeCategory, products]);

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
            {queryParam ? `نتائج البحث` : activeCategory !== "all" ? categories.find(c => c.id === activeCategory)?.name : "المتجر التقني"}
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
              تصفّح أفضل المنتجات التقنية             </p>
          )}
        </div>

        <div className="flex flex-col lg:flex-row items-center gap-6 w-full lg:w-auto">
          <div className="relative w-full sm:w-[240px] z-30">
            <motion.button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className="flex items-center justify-between gap-3 w-full bg-white/40 dark:bg-white/80 backdrop-blur-xl border border-primary/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-primary dark:text-primary-foreground shadow-sm hover:bg-white/60 hover:shadow-md transition-all"
            >
                <div className="flex items-center gap-2">
                  <SlidersHorizontal size={18} />
                  <span>تصفية: {selectedSort}</span>
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
                  className="absolute top-full mt-3 w-full bg-white/70 dark:bg-white/90 backdrop-blur-2xl border border-primary/5 rounded-[1.25rem] p-2 shadow-[0_15px_40px_-5px_rgba(22,54,68,0.15)] overflow-hidden"
                >
                  {sortOptions.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => { 
                        setSelectedSort(opt); 
                        const catId = categories.find(c => c.name === opt)?.id || "all";
                        setActiveCategory(catId);
                        setIsSortOpen(false); 
                      }}
                      className={`w-full text-right px-4 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${selectedSort === opt
                          ? 'bg-primary text-primary-foreground shadow-md translate-x-[-4px]'
                          : 'text-primary dark:text-primary-foreground hover:bg-primary/5 hover:translate-x-[-4px]'
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
          <a href="/shop" className="inline-block mt-4 bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors">
            عرض كل المنتجات
          </a>
        </motion.div>
      )}
    </main>
  );
}

export default function ShopPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white relative">
      <Header />

      {/* Background decorative element */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[100px] -z-10" />

      <Suspense fallback={
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-primary/5 rounded-2xl w-48" />
            <div className="h-6 bg-primary/5 rounded-xl w-96" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
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
