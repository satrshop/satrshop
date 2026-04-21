"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Truck, Clock, Package } from "lucide-react";

export default function ShippingPage() {
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
            <Truck size={32} />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">الشحن والتوصيل</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">سريعين في الشحن كما نحن سريعين في كتابة الكود!</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] shadow-sm border border-border prose prose-lg prose-slate max-w-none rtl"
          dir="rtl"
        >
          <h3 className="text-2xl font-bold text-primary dark:text-primary-foreground mb-4 flex items-center gap-3"><Clock className="text-secondary" /> المدة المستغرقة</h3>
          <p className="text-primary/80 dark:text-primary-foreground/80 font-medium mb-8">
            نقوم بمعالجة الطلبات خلال 24 ساعة من تأكيد الشراء. التوصيل لعَمّان يستغرق (1 - 3 أيام عمل). التوصيل لباقي المحافظات يستغرق (3 - 5 أيام عمل).
          </p>

          <h3 className="text-2xl font-bold text-primary dark:text-primary-foreground mb-4 flex items-center gap-3"><Package className="text-secondary" /> تكلفة الشحن</h3>
          <p className="text-primary/80 dark:text-primary-foreground/80 font-medium mb-8">
            تكلفة الشحن الثابتة لجميع محافظات الأردن هي 2.50 د.ا ونوفر <strong>شحناً مجانياً</strong> للطلبات التي تزيد قيمتها عن 35.00 د.ا تلقائياً عند الدفع.
          </p>

          <h3 className="text-2xl font-bold text-primary dark:text-primary-foreground mb-4 flex items-center gap-3"><Truck className="text-secondary" /> شركات الشحن المعتمدة</h3>
          <p className="text-primary/80 dark:text-primary-foreground/80 font-medium">
            نتعامل مع أفضل مزودي الخدمات اللوجستية مثل أرامكس (Aramex) لضمان وصول ملابسك التقنية بحالة ممتازة وبأسرع وقت ممكن لباب منزلك.
          </p>
        </motion.div>
      </main>
    </div>
  );
}
