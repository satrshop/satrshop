"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, X, Info, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const HELP_CONTENT: Record<string, { title: string; desc: string; steps: string[] }> = {
  "/admin": {
    title: "لوحة التحكم العامة",
    desc: "هذه الصفحة تعطيك نظرة شاملة على أداء المتجر في الوقت الحالي.",
    steps: [
      "متابعة إجمالي المبيعات وصافي الأرباح.",
      "مراقبة الطلبات المعلقة التي تحتاج لمعالجة.",
      "تنبيهات المخزون للمنتجات التي أوشكت على النفاد.",
      "قائمة بأحدث 5 طلبات تمت مؤخراً."
    ]
  },
  "/admin/products": {
    title: "إدارة المنتجات",
    desc: "من هنا يمكنك إضافة وإدارة جميع المنتجات المعروضة في المتجر.",
    steps: [
      "إضافة منتج جديد مع تحديد السعر، الوصف، والصور.",
      "تعديل بيانات المنتجات الحالية أو حذفها.",
      "تحديد ما إذا كان المنتج 'جديد' ليظهر في الصفحة الرئيسية.",
      "البحث عن منتجات محددة باستخدام شريط البحث."
    ]
  },
  "/admin/inventory": {
    title: "إدارة المخزون والتكاليف",
    desc: "هذه الصفحة مخصصة للمحاسبة ومتابعة الكميات بدقة.",
    steps: [
      "تحديث كميات المخزون المتوفرة (Stock).",
      "إدخال سعر التكلفة (Cost Price) لكل منتج لحساب الأرباح.",
      "مراقبة المنتجات التي نفدت كمياتها لإعادة الطلب.",
      "تحديث البيانات يتم بشكل فوري بمجرد الحفظ."
    ]
  },
  "/admin/orders": {
    title: "إدارة الطلبات",
    desc: "محرك المتجر، هنا تتم معالجة طلبات العملاء من البداية للنهاية.",
    steps: [
      "مشاهدة تفاصيل كل طلب (المنتجات، العنوان، السعر).",
      "تغيير حالة الطلب (قيد المعالجة، تم الشحن، ملغي).",
      "فلترة الطلبات حسب حالتها لتسريع العمل.",
      "التأكد من استلام المبالغ وتحديث الحالة لـ 'تم التوصيل'."
    ]
  },
  "/admin/customers": {
    title: "قاعدة بيانات الزبائن",
    desc: "عرض وإدارة معلومات الزبائن الذين قاموا بالطلب من المتجر.",
    steps: [
      "عرض أسماء الزبائن وأرقام هواتفهم.",
      "معرفة تاريخ تسجيل وموقع كل زبون.",
      "تحليل أكثر الزبائن تفاعلاً مع المتجر.",
      "استخراج بيانات التواصل لتنفيذ عمليات التسويق."
    ]
  },
  "/admin/messages": {
    title: "صندوق الرسائل",
    desc: "التواصل المباشر مع زوار المتجر والزبائن.",
    steps: [
      "قراءة الاستفسارات والشكاوى الواردة عبر الموقع.",
      "تحديد الرسائل المقروءة وغير المقروءة.",
      "الرد على الزبائن لرفع مستوى الخدمة.",
      "حذف الرسائل القديمة أو غير الهامة."
    ]
  }
};

export default function AdminHelp() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  
  const content = HELP_CONTENT[pathname] || {
    title: "دليل الاستخدام",
    desc: "اختر صفحة من القائمة الجانبية لعرض شرح مفصل عنها.",
    steps: ["استخدم القائمة الجانبية للتنقل بين الأقسام.", "تأكد من حفظ التغييرات قبل الخروج من الصفحة."]
  };

  return (
    <div className="fixed bottom-10 left-10 z-[100] print:hidden">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20, x: -20 }}
            className="absolute bottom-16 left-0 w-[350px] bg-white/90 backdrop-blur-2xl border border-primary/10 rounded-[2.5rem] p-8 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] text-right"
            dir="rtl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                  <Info size={22} />
                </div>
                <h3 className="font-black text-xl text-primary">{content.title}</h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-slate-600 font-bold mb-6 leading-relaxed">
              {content.desc}
            </p>

            <div className="space-y-4">
              {content.steps.map((step, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="mt-1">
                    <ChevronRight size={16} className="text-secondary" />
                  </div>
                  <span className="text-slate-500 font-medium leading-normal">{step}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                فريق تطوير سطر &copy; 2026
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen ? "bg-white text-primary border border-primary/10" : "bg-primary text-white"
        }`}
      >
        {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
      </motion.button>
    </div>
  );
}
