"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Ruler } from "lucide-react";

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20 relative">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <Ruler size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">دليل المقاسات</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">اكتشف المقاس المناسب لك بسهولة وبدقة.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] shadow-sm border border-border"
        >
          <p className="text-muted-foreground dark:text-primary-foreground font-medium leading-relaxed text-center">
            سيتم إضافة جدول المقاسات قريباً. جميع منتجاتنا تأتي بتصميم Oversize مريح ليناسب فترات العمل والبرمجة الطويلة. 
            ننصح دائماً باختيار مقاسك المعتاد للحصول على هذا المظهر المريح.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
