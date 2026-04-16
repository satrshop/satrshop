"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { RefreshCcw, ShieldCheck, MailQuestion } from "lucide-react";

export default function ReturnsPage() {
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
            <RefreshCcw size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">سياسة الاسترجاع</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">رضاكم هو هدفنا الأساسي. تسوق بثقة تامة.</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] shadow-sm border border-border space-y-8 sm:space-y-10"
        >
          <div>
            <h3 className="text-2xl font-bold text-[#2C6A87] mb-4 flex items-center gap-3"><ShieldCheck className="text-secondary" /> شروط الاسترجاع والاستبدال</h3>
            <ul className="list-disc list-inside space-y-2 text-[#2C6A87]/80 font-medium leading-relaxed ms-2">
              <li>يحق للعميل استرجاع المنتج خلال 7 أيام من تاريخ استلام الطلب.</li>
              <li>يحق الاستبدال خلال 14 يوماً من الاستلام لتغيير المقاس أو الموديل.</li>
              <li>يجب أن يكون المنتج بحالته الأصلية، غير مستخدم، وبكافة البطاقات المرفقة (Tags).</li>
              <li>يتحمل العميل تكلفة بوليصة الشحن للاسترجاع (3.00 د.ا) إلا في حال كان هناك عيب مصنعي في المنتج.</li>
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-[#2C6A87] mb-4 flex items-center gap-3"><MailQuestion className="text-secondary" /> طريقة طلب الاسترجاع</h3>
            <p className="text-[#2C6A87]/80 font-medium leading-relaxed">
              يمكنك طلب الاسترجاع فوراً عبر التواصل مع خدمة العملاء من خلال صفحة "تواصل معنا" أو إرسال إيميل إلى <span className="font-bold text-[#2C6A87]">satrshopp@gmail.com</span> مرفقاً به رقم الطلب. سيقوم فريق الدعم بمراجعة طلبك وإصدار بوليصة استرجاع في غضون 24 ساعة عمل.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
