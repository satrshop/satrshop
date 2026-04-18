"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function StoryBanner() {
  return (
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
            alt="عينات من ملابس متجر سطر التقنية - هوديز وتيشرتات للمبرمجين"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
