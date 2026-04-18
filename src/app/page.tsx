import Header from "@/components/layout/Header";
import HeroSection from "@/components/home/HeroSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import StoryBanner from "@/components/home/StoryBanner";

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
