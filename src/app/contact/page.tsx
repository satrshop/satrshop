"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import Header from "@/components/layout/Header";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    content: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ name: "", email: "", phone: "", content: "" });
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert(data.error || "فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.");
      }
    } catch {
      alert("فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.");
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16 text-right" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-10 sm:mb-16"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">تواصل معنا</h1>
          <p className="text-base sm:text-lg text-muted-foreground font-medium">
            فريق سطر متواجد دائماً لمساعدتك. سواء كان لديك استفسار عن مقاسات المنتجات التقنية، أو مشكلة في الطلب، يسعدنا التحدث إليك.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 sm:gap-16">
          {/* Contact Form or Success Card */}
          <div className="relative min-h-[500px]">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-primary p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] shadow-xl border border-primary/20 h-full"
                >
                  <h2 className="text-2xl font-bold text-primary-foreground mb-8">أرسل لنا رسالة</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-primary-foreground/90 mb-2">الاسم الكامل</label>
                        <input 
                          required
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          type="text" 
                          className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:border-secondary transition-colors" 
                          placeholder="أحمد محمد" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-primary-foreground/90 mb-2">رقم الهاتف (اختياري)</label>
                        <input 
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          type="tel" 
                          className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 text-right focus:outline-none focus:border-secondary transition-colors" 
                          placeholder="07x xxx xxxx" 
                          dir="ltr" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary-foreground/90 mb-2">البريد الإلكتروني</label>
                      <input 
                        required
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        type="email" 
                        className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 text-left focus:outline-none focus:border-secondary transition-colors" 
                        placeholder="email@example.com" 
                        dir="ltr" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-primary-foreground/90 mb-2">محتوى الرسالة</label>
                      <textarea 
                        required
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        className="w-full bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/50 border border-primary-foreground/20 rounded-xl px-4 py-3 h-32 resize-none focus:outline-none focus:border-secondary transition-colors" 
                        placeholder="كيف يمكننا مساعدتك؟" 
                      />
                    </div>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-secondary text-secondary-foreground py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-secondary group transition-all shadow-lg shadow-secondary/20 flex items-center justify-center gap-2 disabled:opacity-50 border border-transparent"
                    >
                      {loading ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <Send size={20} />
                          إرسال الرسالة
                        </>
                      )}
                    </motion.button>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-primary p-6 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] shadow-xl border border-primary/20 flex flex-col items-center justify-center text-center h-full text-white"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
                    className="w-24 h-24 bg-secondary/20 rounded-full flex items-center justify-center mb-8 text-secondary"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h2 className="text-3xl font-black mb-4 text-white">تم الإرسال بنجاح!</h2>
                  <p className="text-white/70 font-bold mb-10 leading-relaxed max-w-xs">
                    نشكرك على تواصلك معنا، سنقوم بمراجعة رسالتك والرد عليك في أقرب وقت ممكن.
                  </p>
                  <button
                    onClick={() => setSuccess(false)}
                    className="bg-secondary text-white px-8 py-3 rounded-xl font-bold hover:bg-[#a87d2b] transition-colors"
                  >
                    إرسال رسالة أخرى
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

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
                <a href="mailto:support@satrshop.com" className="text-secondary font-bold text-lg hover:underline" dir="ltr">satrshopp@gmail.com</a>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Phone size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">الهاتف المباشر</h3>
                <p className="text-muted-foreground mb-1">أوقات العمل: 9 صباحاً - 6 مساءً</p>
                <a href="tel:+96270000000" className="text-secondary font-bold text-lg hover:underline" dir="ltr">+962 7 9841 9463</a>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
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
