import { Metadata } from "next";
import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import StoryBanner from "@/components/home/StoryBanner";

export const metadata: Metadata = {
  title: "متجر سطر | المتجر التقني الأول للمبرمجين في الأردن",
  description: "اكتشف أحدث صيحات الموضة التقنية. هوديز، تيشرتات، وإكسسوارات مصممة خصيصاً للمبرمجين. جودة عالية، تصميم مريح، وتوصيل سريع لكافة أنحاء الأردن.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return (
    <div className="min-h-screen bg-background relative selection:bg-secondary selection:text-white">
      <Header />
      <HeroSection />
      <FeaturedProducts />
      <StoryBanner />
    </div>
  );
}
