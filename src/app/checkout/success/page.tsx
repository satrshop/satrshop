"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Package, ShoppingBag, ArrowLeft, Home } from "lucide-react";
import Header from "@/components/layout/Header";

import { useCartStore } from "@/store/useCartStore";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-32 sm:pt-40 lg:pt-48 pb-20">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="bg-primary rounded-[3rem] p-8 sm:p-12 md:p-16 shadow-2xl border border-white/10 text-center relative overflow-hidden text-white"
      >
        {/* Background decorative element */}
        <div className="absolute -top-24 -left-24 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -z-10" />
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 12 }}
          className="w-24 h-24 sm:w-32 sm:h-32 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-8 sm:mb-10 text-secondary"
        >
          <CheckCircle2 size={64} className="sm:w-20 sm:h-20" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-6"
        >
          شكراً لثقتك بنا!
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-lg sm:text-xl text-white/80 font-medium mb-10 max-w-lg mx-auto"
        >
          تم استلام طلبك بنجاح وسنقوم بالتواصل معك لتأكيد التوصيل في أقرب وقت ممكن.
        </motion.p>

        {orderId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white/10 border border-white/20 rounded-2xl p-4 sm:p-6 mb-12 inline-flex flex-col sm:flex-row items-center gap-2 sm:gap-4"
          >
            <span className="text-white/60 font-bold">رقم الطلب:</span>
            <span className="text-secondary font-black text-lg select-all bg-white/10 px-4 py-1.5 rounded-lg border border-white/20">
              #{orderId}
            </span>
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link href="/" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-secondary text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#a87d2b] transition-all shadow-lg shadow-secondary/20">
              الرئيسية
              <Home size={20} />
            </button>
          </Link>
          <Link href="/shop" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 text-white border-2 border-white/20 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all">
              العودة للمتجر
              <ShoppingBag size={20} />
            </button>
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-[#FDF4E3]">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <CheckCircle2 className="w-16 h-16 text-secondary animate-pulse" />
        </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
