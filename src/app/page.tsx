"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/db/products";
import { Product } from "@/types/models/product";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const products = await getProducts();
        // Take the first 4 for the homepage
        setFeaturedProducts(products.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <div className="min-h-screen bg-background relative selection:bg-secondary selection:text-white">
      <Header />

      {/* Hero Section */}
      <div className="px-3 sm:px-4 md:px-8 pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-16">
        <div className="w-full max-w-[1500px] mx-auto relative rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
          {/* Full-width Background Images */}
          <Image src="/images/bgblue.png" alt="خلفية سطر" fill sizes="100vw" className="object-cover z-0 pointer-events-none dark:hidden block" priority />
          <Image src="/images/bg2.png" alt="خلفية سطر" fill sizes="100vw" className="object-cover z-0 pointer-events-none hidden dark:block" priority />

          <main className="w-full px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-28 flex flex-col lg:flex-row items-center gap-8 sm:gap-12 lg:gap-16 relative z-10">
            {/* Background decorative blur - hidden on mobile for performance */}
            <div className="hidden sm:block absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/15 rounded-full filter blur-[100px] -z-10" />

        {/* Content Side */}
        <motion.div
          className="flex-1 flex flex-col justify-center space-y-6 sm:space-y-8 lg:space-y-10 z-10 w-full text-right"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 variants={fadeInUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.2] text-white tracking-tight">
            الجودة بلغة <br /><span className="text-transparent bg-clip-text bg-gradient-to-l from-white to-secondary block mt-2 pb-2">تليق بك.</span>
          </motion.h1>

          <motion.p variants={fadeInUp} className="text-base sm:text-lg md:text-xl text-white/90 font-medium max-w-lg leading-relaxed border-r-4 border-secondary pr-4 drop-shadow-md">
            نوفر لك طابعاً فريداً يجمع بين الفخامة وإلهام التشفير. ارتقِ بمظهرك مع مجموعتنا التقنية الحديثة المصممة خصيصاً للمبرمجين.
          </motion.p>

          <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-end sm:justify-start gap-3 sm:gap-4 pt-2 sm:pt-4">
            <Link href="/shop" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-gradient-to-r from-secondary to-[#c79122] text-secondary-foreground h-12 sm:h-14 w-full sm:w-auto px-8 sm:px-10 rounded-2xl font-bold text-lg sm:text-xl transition-all shadow-lg hover:shadow-xl border border-white/10 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/20 w-[200%] translate-x-[-150%] skew-x-[-30deg] group-hover:translate-x-[150%] transition-transform duration-700 ease-in-out" />
                <span className="relative z-10">تصفح التشكيلة</span>
              </motion.button>
            </Link>
            <Link href="/collections" className="w-full sm:w-auto">
              <motion.button
                whileHover={{ x: -5, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                className="h-12 sm:h-14 w-full sm:w-auto px-6 sm:px-8 rounded-2xl font-bold text-lg sm:text-xl text-white border-2 border-white/30 flex items-center justify-center gap-3 transition-colors hover:bg-white/10 backdrop-blur-md shadow-sm"
              >
                استكشف
                <span className="text-2xl leading-none">&larr;</span>
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: -3 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative w-full max-w-[280px] sm:max-w-sm lg:max-w-md mx-auto lg:mx-0 aspect-square rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl border-[3px] sm:border-[4px] border-secondary/30 group"
        >
          <Image
            src="/images/background.png"
            alt="تشكيلة سطر"
            fill
            sizes="(max-width: 1024px) 100vw, 500px"
            className="object-cover transition-transform duration-[2s] ease-out group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#163644]/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 flex items-end justify-center pb-6 sm:pb-8 p-4 sm:p-6 backdrop-blur-[2px]">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-center"
            >
              <p className="text-secondary text-xs sm:text-sm font-bold tracking-widest mb-2 uppercase">موسم 2026</p>
              <p className="text-white text-xl sm:text-3xl font-extrabold drop-shadow-md">مجموعة الخريف التقنية</p>
            </motion.div>
          </div>
        </motion.div>
        </main>
        </div>
      </div>

      {/* Products Grid Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-12">
          <div className="text-right w-full sm:w-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 text-right">وصل حديثاً</h2>
            <p className="text-muted-foreground text-base sm:text-lg text-right">أحدث الإصدارات الخاصة بالموسم التقني الجديد.</p>
          </div>
          <Link href="/shop" className="hidden sm:inline-block text-primary font-bold hover:text-secondary transition-colors underline decoration-2 underline-offset-8 whitespace-nowrap">
            عرض كل المنتجات
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-[4/5] bg-primary/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {featuredProducts.length > 0 ? (
              featuredProducts.map((prod, idx) => (
                <ProductCard key={prod.id ?? idx} product={prod} index={idx} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-primary/5 rounded-3xl">
                <p className="text-muted-foreground">لا يوجد منتجات متاحة حالياً.</p>
              </div>
            )}
          </div>
        )}

        <div className="mt-10 sm:hidden flex justify-center">
          <Link href="/shop" className="text-primary font-bold hover:text-secondary transition-colors underline decoration-2 underline-offset-8 whitespace-nowrap">
            عرض كل المنتجات
          </Link>
        </div>
      </section>

      {/* Scroll-Reveal Banner */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full text-white py-16 sm:py-24 relative overflow-hidden shadow-inner"
      >
        <Image
          src="/images/bgblue.png"
          alt="خلفية سطر"
          fill
          sizes="100vw"
          className="object-cover z-0 pointer-events-none dark:hidden block"
        />
        <Image
          src="/images/bg2.png"
          alt="خلفية سطر"
          fill
          sizes="100vw"
          className="object-cover z-0 pointer-events-none hidden dark:block"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-10 sm:gap-16 relative z-10">
          <div className="max-w-xl text-right">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 sm:mb-6 text-secondary drop-shadow-sm leading-tight">تصميم يروي الكود</h2>
              <p className="text-base sm:text-lg md:text-xl text-white/90 leading-relaxed font-medium">
                تفاصيل دقيقة، جودة قماش عالية، ولمسات مستوحاة من أعظم التقنيات. نحن في متجر سطر نؤمن بأن ملابسك يجب أن تعكس هويتك البرمجية بحداثة ورقي.
              </p>
            </motion.div>
          </div>

          <motion.div
            whileHover={{ rotate: 1, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="relative w-full md:w-1/2 aspect-video lg:aspect-[16/10] rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-4 border-white/10"
          >
            <Image
              src="/images/img.png"
              alt="عينات المتجر"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
