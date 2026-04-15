"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

const DUMMY_PRODUCTS = [
  { id: "1", name: "هودي المبرمج (Dark Mode)", price: 299, image: "/images/img.png", category: "هوديز تقنية", rating: 4.9, isNew: true },
  { id: "2", name: "تيشرت 'console.log'", price: 149, image: "/images/background.png", category: "تيشرتات", rating: 4.7 },
  { id: "3", name: "سترة المطورين الشتوية", price: 399, image: "/images/img.png", category: "جواكيت", rating: 5.0, isNew: true },
  { id: "4", name: "هودي Python Edition", price: 289, image: "/images/background.png", category: "هوديز تقنية", rating: 4.8 },
  { id: "5", name: "حقيبة ظهر للمبرمجين", price: 199, image: "/images/img.png", category: "حقائب", rating: 4.6 },
  { id: "6", name: "تيشرت 'Bug fixes'", price: 129, image: "/images/background.png", category: "تيشرتات", rating: 4.5 },
  { id: "7", name: "قبعة سطر (كاب)", price: 89, image: "/images/img.png", category: "إكسسوارات", rating: 4.8, isNew: true },
  { id: "8", name: "جاكيت مبطن 'Open Source'", price: 450, image: "/images/background.png", category: "جواكيت", rating: 5.0 },
];

export default function ShopPage() {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState("ترتيب حسب: الأحدث");
  const sortOptions = ["ترتيب حسب: الأحدث", "السعر: من الأقل للأعلى", "السعر: من الأعلى للأقل", "الأعلى تقييماً"];

  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20 relative">
      <Header />
      
      {/* Background decorative element */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-secondary/5 rounded-full filter blur-[100px] -z-10" />

      <main className="max-w-7xl mx-auto px-6 pt-36 lg:pt-48 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 border-b border-border pb-10"
        >
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4">المتجر التقني</h1>
            <p className="text-lg text-muted-foreground font-medium max-w-2xl">
              تصفح التشكيلة الكاملة من أزياء متجر سطر. مصممة بدقة للمبرمجين وطلبة تكنولوجيا المعلومات.
            </p>
          </div>
          
          <div className="flex items-center gap-4 relative z-20">
            <div className="relative">
              <motion.button 
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="flex items-center justify-between gap-3 w-[280px] bg-white/40 backdrop-blur-xl border border-primary/10 rounded-[1.25rem] px-5 py-4 text-sm font-bold text-primary shadow-sm hover:bg-white/60 hover:shadow-md transition-all"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
           {DUMMY_PRODUCTS.map((prod, idx) => (
             <ProductCard key={prod.id} product={prod} index={idx} />
           ))}
        </div>
      </main>
    </div>
  );
}
