"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight, Ghost, Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import { useWishlistStore } from "@/store/useWishlistStore";

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#FDF4E3] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDF4E3]">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-40 pb-20">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 text-[#2C6A87]"
            >
              <Heart size={32} className="fill-[#2C6A87]" />
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                المفضلة
              </h1>
            </motion.div>
            <p className="text-lg text-[#2C6A87] font-medium max-w-xl opacity-90">
              هنا تجد كل المنتجات التي نالت إعجابك. يمكنك إضافتها للسلة في أي وقت لتكتمل أناقتك.
            </p>
          </div>

          {items.length > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={clearWishlist}
              className="text-primary font-bold hover:underline py-2"
            >
              مسح الكل
            </motion.button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {items.length > 0 ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-8"
            >
              {items.map((product, idx) => (
                <ProductCard key={product.id} product={product} index={idx} />
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-20 sm:py-32 text-center space-y-8 bg-white/60 backdrop-blur-md rounded-[3rem] border border-white/50"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                <Ghost size={120} className="text-[#2C6A87]/30 relative animate-bounce" />
                <Heart size={40} className="absolute -top-2 -right-2 text-[#2C6A87] fill-[#2C6A87] animate-pulse" />
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-[#2C6A87]">قائمتك فارغة الآن</h2>
                <p className="text-[#2C6A87]/70 max-w-xs mx-auto font-medium">
                  لم تقم بإضافة أي منتج للمفضلة بعد. انتقل للمتجر واكتشف تشكيلتنا الجديدة!
                </p>
              </div>

              <Link href="/shop">
                <button className="flex items-center gap-3 bg-[#2C6A87] text-white px-10 py-4 rounded-2xl font-black text-xl shadow-xl shadow-[#2C6A87]/20 hover:bg-[#1e4a5e] transition-all active:scale-[0.98]">
                  اكتشف المتجر
                  <ArrowRight size={20} className="rotate-180" />
                </button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivation Section */}
        {items.length > 0 && (
          <div className="mt-20 p-8 sm:p-12 bg-primary text-primary-foreground rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-secondary/20 blur-[100px] -mr-32 -mt-32" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-right">
                <h3 className="text-2xl sm:text-3xl font-black">جاهز للطلب؟</h3>
                <p className="opacity-80 font-bold">يمكنك نقل المنتجات للسلة بضغطة واحدة من البطاقة أعلاه.</p>
              </div>
              <Link href="/shop">
                <button className="bg-secondary text-white px-8 py-4 rounded-xl font-black text-lg hover:bg-white hover:text-secondary transition-all shadow-lg border border-transparent hover:border-secondary">
                  مواصلة التسوق
                </button>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
