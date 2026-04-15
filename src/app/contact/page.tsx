"use client";

import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import Header from "@/components/layout/Header";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-6 pt-36 lg:pt-48 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-foreground mb-6">تواصل معنا</h1>
          <p className="text-lg text-muted-foreground font-medium">
            فريق سطر متواجد دائماً لمساعدتك. سواء كان لديك استفسار عن مقاسات المنتجات التقنية، أو مشكلة في الطلب، يسعدنا التحدث إليك.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-primary p-8 md:p-12 rounded-[2rem] shadow-xl border border-primary/20"
          >
            <h2 className="text-2xl font-bold text-primary-foreground mb-8">أرسل لنا رسالة</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-primary-foreground/90 mb-2">الاسم الكامل</label>
                  <input type="text" className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors" placeholder="أحمد محمد" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-primary-foreground/90 mb-2">رقم الهاتف (اختياري)</label>
                  <input type="tel" className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-secondary transition-colors" placeholder="05x xxx xxxx" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-foreground/90 mb-2">البريد الإلكتروني</label>
                <input type="email" className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-secondary transition-colors" placeholder="email@example.com" dir="ltr" />
              </div>
              <div>
                <label className="block text-sm font-bold text-primary-foreground/90 mb-2">محتوى الرسالة</label>
                <textarea className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:border-secondary transition-colors" placeholder="كيف يمكننا مساعدتك؟" />
              </div>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-secondary text-white py-4 rounded-xl font-bold text-lg hover:bg-[#a87d2b] transition-colors shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
              >
                <Send size={20} />
                إرسال الرسالة
              </motion.button>
            </form>
          </motion.div>

          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col justify-center space-y-12"
          >
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Mail size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">البريد الإلكتروني</h3>
                <p className="text-muted-foreground mb-1">للاستفسارات العامة ودعم العملاء</p>
                <a href="mailto:support@satrshop.com" className="text-secondary font-bold text-lg hover:underline" dir="ltr">support@satrshop.com</a>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Phone size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">الهاتف المباشر</h3>
                <p className="text-muted-foreground mb-1">أوقات العمل: 9 صباحاً - 6 مساءً</p>
                <a href="tel:+96270000000" className="text-secondary font-bold text-lg hover:underline" dir="ltr">+962 7 000 0000</a>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                <MapPin size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">المقرات الإدارية</h3>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  متجر سطر، عَمّان<br />
                  المملكة الأردنية الهاشمية<br />
                  <span className="text-sm font-normal text-muted-foreground mt-2 inline-block">(المتجر إلكتروني بالكامل ولا توجد صالة عرض حالياً)</span>
                </p>
              </div>
            </div>
            
          </motion.div>
        </div>
      </main>
    </div>
  );
}
