"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

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

export default function HeroSection() {
  return (
    <div className="px-3 sm:px-4 md:px-8 pt-24 sm:pt-28 md:pt-32 pb-10 sm:pb-16">
      <div className="w-full max-w-[1500px] mx-auto relative rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl">
        {/* Full-width Background Images */}
        <Image src="/images/bg2.png" alt="خلفية متجر سطر الرسمية - سطوع عالي" fill sizes="100vw" className="object-cover z-0 pointer-events-none dark:hidden block" priority />
        <Image src="/images/bgblue.png" alt="خلفية متجر سطر الرسمية - الوضع الداكن" fill sizes="100vw" className="object-cover z-0 pointer-events-none hidden dark:block" priority />

        <main className="w-full px-4 sm:px-6 pt-4 sm:pt-6 md:pt-10 lg:pt-12 pb-12 sm:pb-16 md:pb-20 lg:pb-28 flex flex-col lg:flex-row items-center lg:items-start gap-8 sm:gap-12 lg:gap-16 relative z-10">
          {/* Background decorative blur - hidden on mobile for performance */}
          <div className="hidden sm:block absolute top-0 right-0 w-[400px] h-[400px] bg-secondary/15 rounded-full filter blur-[100px] -z-10" />

          {/* Content Side */}
          <motion.div
            className="flex-1 flex flex-col justify-start space-y-6 sm:space-y-8 lg:space-y-10 z-10 w-full text-right pt-2"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-extrabold leading-[1.2] text-primary dark:text-white tracking-tight"
            >
              مرحباً بك في <span className="dark:text-secondary">متجر سطر</span> <br />
              <span className="text-secondary dark:text-secondary block mt-2 pb-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-medium">سَـطْـر فِكْـرة تُكتـبُ وأثَـر يَبْـقَى.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-base sm:text-lg md:text-xl text-primary/80 dark:text-white/90 font-medium max-w-lg leading-relaxed border-r-4 border-secondary pr-4 drop-shadow-md"
            >
              حيث تبدأ تفاصيل الحكاية
              تصاميم عصرية بلمسة فريدة .. مصنوعة بدقة لتمنحك حضورا مميزا
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-end sm:justify-start gap-3 sm:gap-4 pt-6 sm:pt-8 md:pt-10">
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
                  whileHover={{ x: -5, backgroundColor: "var(--primary)", color: "white", transition: { duration: 0.2 } }}
                  className="h-12 sm:h-14 w-full sm:w-auto px-6 sm:px-8 rounded-2xl font-bold text-lg sm:text-xl text-primary dark:text-white border-2 border-primary/30 dark:border-white/30 flex items-center justify-center gap-3 transition-all hover:bg-primary hover:text-white dark:hover:bg-white/10 backdrop-blur-md shadow-sm"
                >
                  استكشف
                  <span className="text-2xl leading-none dark:text-white">&larr;</span>
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
              src="/images/herosection.JPG"
              alt="أحدث تشكيلة ملابس ومستلزمات المبرمجين من متجر سطر"
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

              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
