"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { ShieldCheck } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20 relative">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">سياسة الخصوصية</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">نحن نقدر بياناتك ونحميها.</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] shadow-sm border border-border"
        >
          <p className="text-muted-foreground font-medium leading-relaxed">
            في متجر سطر، تعتبر الخصوصية والأمن من أهم أولوياتنا لأننا، كأشخاص تقنيين، ندرك تماماً أهمية حماية البيانات والمعلومات.
            يتم تشفير كافة معلوماتك ولا تتم مشاركتها مع أي أطراف ثالثة لأغراض تجارية إطلاقاً.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
