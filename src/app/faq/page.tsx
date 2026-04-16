"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/layout/Header";
import { ChevronDown } from "lucide-react";

const FAQS = [
  { q: "ما هي طرق الدفع المتاحة؟", a: "نقبل الدفع عبر البطاقات الائتمانية (Visa/Mastercard)، كليك (CliQ)، زين كاش، بالإضافة للدفع عند الاستلام." },
  { q: "هل الخامات مريحة أثناء جلسات البرمجة الطويلة؟", a: "بالتأكيد! حرصنا في سطر على اختيار خامات قطنية 100٪ توفر راحة فائقة لتصاحبك لساعات البرمجة والعمل الطويلة دون أي إزعاج." },
  { q: "كيف أستطيع تتبع طلبي؟", a: "بمجرد شحن طلبك، سيصلك رقم تتبع عبر البريد الإلكتروني والرسائل النصية لمعرفة حالة شحنتك لحظة بلحظة." },
  { q: "هل يتوفر شحن لخارج الأردن؟", a: "حالياً، نلبي طلبات المملكة الأردنية الهاشمية وبعض دول الخليج المحددة. قريباً سنقوم بالتوسع عالمياً!" }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20 relative">
      <Header />
      <div className="absolute top-20 left-10 w-[400px] h-[400px] bg-primary/5 rounded-full filter blur-[100px] -z-10" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-16"
        >
          <span className="text-secondary font-bold tracking-widest text-sm mb-4 inline-block">عن المتجر</span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">الأسئلة الشائعة</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">كل ما تحتاج معرفته عن التسوق في متجر سطر، جمعناه لك هنا.</p>
        </motion.div>

        <div className="space-y-4 sm:space-y-6">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-primary rounded-xl sm:rounded-[1.5rem] shadow-xl border border-primary/20 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="w-full text-right p-4 sm:p-6 md:p-8 flex items-center justify-between gap-3 sm:gap-4 focus:outline-none touch-manipulation"
              >
                <div className="flex items-center gap-4">
                  <span className="text-secondary font-mono bg-primary-foreground/10 px-3 py-1 rounded-lg shadow-inner flex-shrink-0">{(index + 1).toString().padStart(2, '0')}.</span> 
                  <h3 className="text-base sm:text-lg md:text-xl font-bold text-primary-foreground">{faq.q}</h3>
                </div>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="flex-shrink-0">
                  <ChevronDown className="text-secondary" size={24} />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-6 md:px-8 md:pb-8 pt-0 custom-accordion-content rtl">
                      <p className="text-primary-foreground/80 font-medium leading-relaxed ms-[4.2rem]">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
