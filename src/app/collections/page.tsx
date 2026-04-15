"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const COLLECTIONS = [
  { id: "winter", title: "مجموعة الخريف التقنية", subtitle: "إصدار محدود", desc: "هوديز قطنية ثقيلة وجواكيت توفر الدفء والأناقة في أطول جلسات البرمجة.", image: "/images/background.png" },
  { id: "darkmode", title: "مجموعة Dark Mode", subtitle: "الطابع الرسمي", desc: "تصاميم تعكس الجانب المظلم من الشاشة، لمحبي الألوان الداكنة والراحة المستمرة.", image: "/images/img.png" },
  { id: "basics", title: "الأساسيات (Basics)", subtitle: "للاستخدام اليومي", desc: "تيشرتات مصممة بصيغة مينيمالستيك، مريحة ويومية لترافقك إلى مكتبك.", image: "/images/background.png" },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20 relative">
      <Header />
      
      {/* Decorative Blob */}
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] -z-10" />

      <main className="max-w-7xl mx-auto px-6 pt-36 lg:pt-48 pb-16">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground mb-6">مجموعاتنا التقنية</h1>
          <p className="text-xl text-muted-foreground font-medium leading-relaxed">
            استكشف تصنيفاتنا المصممة خصيصاً لتناسب أسلوب حياتك البرمجي والتقني. كل مجموعة لها طابع، وكل طابع يعكس سطر كود مختلف.
          </p>
        </motion.div>

        <div className="space-y-12 lg:space-y-24">
          {COLLECTIONS.map((col, index) => (
            <motion.div 
              key={col.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-12 lg:gap-20`}
            >
              {/* Image Side */}
              <div className="flex-1 relative w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Text Side */}
              <div className="flex-1 text-right w-full">
                <span className="text-secondary font-bold tracking-widest text-sm mb-4 inline-block">{col.subtitle}</span>
                <h2 className="text-4xl lg:text-5xl font-extrabold text-foreground mb-6">{col.title}</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-8 font-medium">
                  {col.desc}
                </p>
                
                <Link href="/shop" passHref>
                  <motion.button 
                    whileHover={{ x: -10 }} 
                    className="inline-flex items-center gap-3 bg-primary text-primary-foreground h-14 px-8 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 hover:bg-[#22556d] transition-all"
                  >
                    استكشف المجموعة
                    <ArrowLeft size={20} />
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
