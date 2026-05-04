"use client";

import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const COLLECTIONS = [
  {
    id: "stickers",
    title: "ستكرز سطر",
    subtitle: "أضف لمستك الخاصة",
    desc: "تشكيلة من الستكرز التقنية المقاومة للماء، مصممة بدقة لتزين لابتوبك ومعداتك البرمجية.",
    image: "/images/herosection.JPG"
  },
  {
    id: "accessories",
    title: "إكسسوارات تقنية",
    subtitle: "تكمل تفاصيلك",
    desc: "قطع فريدة مصممة لتناسب أسلوب حياتك البرمجي، من علاقات مفاتيح إلى ملحقات مكتبية مميزة.",
    image: "/images/click.webp"
  },
  {
    id: "agenda",
    title: "أجندة سطر",
    subtitle: "خطط لمستقبلك",
    desc: "أجندة يومية مصممة لتساعدك على تنظيم مهامك، تدوين أفكارك البرمجية، ورفع إنتاجيتك بأسلوب سطر.",
    image: "/images/ajndas.webp"
  },
];

export default function CollectionsPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-secondary selection:text-white pb-20 relative">
      <Header />

      {/* Decorative Blob */}
      <div className="absolute top-40 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full filter blur-[120px] -z-10" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-48 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12 sm:mb-20"
        >
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-foreground mb-4 sm:mb-6">الأقسام</h1>
          <p className="text-base sm:text-xl text-muted-foreground font-medium leading-relaxed">
            استكشف تصنيفاتنا المصممة خصيصاً لتناسب أسلوب حياتك البرمجي والتقني. كل مجموعة لها طابع، وكل طابع يعكس سطر كود مختلف.
          </p>
        </motion.div>

        <div className="space-y-10 sm:space-y-12 lg:space-y-24">
          {COLLECTIONS.map((col, index) => (
            <motion.div
              key={col.id}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 sm:gap-12 lg:gap-20`}
            >
              {/* Image Side */}
              <div className="flex-1 relative w-full aspect-[4/3] rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border-2 sm:border-4 border-white group">
                <Image
                  src={col.image}
                  alt={col.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                  className="object-cover transition-transform duration-[2s] group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              </div>

              {/* Text Side */}
              <div className="flex-1 text-right w-full">
                <span className="text-secondary font-bold tracking-widest text-sm mb-4 inline-block">{col.subtitle}</span>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 sm:mb-6">{col.title}</h2>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-6 sm:mb-8 font-medium">
                  {col.desc}
                </p>

                <Link href={`/shop?category=${col.id}`} passHref>
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
