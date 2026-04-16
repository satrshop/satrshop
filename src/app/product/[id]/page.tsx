"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  ChevronLeft, 
  Minus, 
  Plus, 
  Star, 
  Heart, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  Loader2,
  ArrowRight
} from "lucide-react";
import Header from "@/components/layout/Header";
import { getProductById, getProducts } from "@/lib/db/products";
import { Product } from "@/types/models/product";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import ProductCard from "@/components/product/ProductCard";

function ProductDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    async function loadProduct() {
      if (typeof id !== 'string') return;
      setLoading(true);
      const data = await getProductById(id);
      if (data) {
        setProduct(data);
        
        // Load related products
        const allProducts = await getProducts();
        const related = allProducts
          .filter(p => p.category === data.category && p.id !== data.id)
          .slice(0, 4);
        setRelatedProducts(related);
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">جاري تحميل تفاصيل المنتج...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-3xl font-black text-primary mb-4">المنتج غير موجود</h1>
        <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
        <Link href="/shop">
          <button className="bg-primary text-white px-8 py-3 rounded-full font-bold">العودة للمتجر</button>
        </Link>
      </div>
    );
  }

  const isFavorited = mounted ? isInWishlist(product.id) : false;

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-40 pb-20">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm font-bold text-muted-foreground mb-8 sm:mb-12 overflow-x-auto whitespace-nowrap pb-2">
        <Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link>
        <ChevronLeft size={16} />
        <Link href="/shop" className="hover:text-primary transition-colors">المتجر</Link>
        <ChevronLeft size={16} />
        <span className="text-primary truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative aspect-square sm:aspect-[4/5] rounded-[2rem] sm:rounded-[3rem] overflow-hidden bg-white shadow-xl border border-border/50"
          >
            <Image 
              src={product.image} 
              alt={product.name} 
              fill 
              className="object-cover"
              priority
            />
            
            {/* Wishlist Floating Button */}
            <button 
              onClick={() => toggleWishlist(product)}
              className="absolute top-6 left-6 w-12 h-12 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-border text-primary hover:text-secondary transition-all z-10"
            >
              <Heart size={24} className={isFavorited ? "fill-secondary text-secondary" : ""} />
            </button>

            {product.isNew && (
              <div className="absolute top-6 right-6 bg-secondary text-white font-black px-4 py-1.5 rounded-full shadow-lg text-sm">
                جديد
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 bg-primary text-white p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl relative overflow-hidden border border-white/10">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -ml-32 -mt-32" />
          
          <div className="relative z-10 space-y-8 sm:space-y-10">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center gap-4">
                <span className="bg-white/10 text-white text-xs sm:text-sm font-black px-4 py-1.5 rounded-full tracking-widest uppercase backdrop-blur-md">
                  {product.category}
                </span>
                <div className="flex items-center gap-1.5 text-secondary">
                  <Star size={18} fill="currentColor" />
                  <span className="font-black text-lg text-white">{product.rating}</span>
                  <span className="text-white/60 text-sm font-bold mr-1">(12+ تقييم)</span>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4">
                <p className="text-3xl sm:text-4xl font-black text-secondary">
                  {product.price.toFixed(2)} د.ا
                </p>
                {product.isNew && (
                  <p className="text-lg text-white/40 line-through font-bold">
                    {(product.price * 1.25).toFixed(2)} د.ا
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-secondary border-r-4 border-secondary pr-4">وصف المنتج</h3>
              <p className="text-lg text-white/80 leading-relaxed font-medium">
                {product.description || `تمتع بالأناقة والراحة مع ${product.name}. صُمم هذا المنتج خصيصاً ليناسب نمط حياة المبرمجين والمبدعين، حيث يجمع بين الجودة العالية في التصنيع والشكل العصري الذي يعكس هويتك التقنية. خامات قطنية 100% تضمن لك الراحة طوال اليوم.`}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Quantity Selector */}
                <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 w-full sm:w-auto">
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-black text-xl text-white">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => prev + 1)}
                    className="w-12 h-12 flex items-center justify-center text-white hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button 
                  onClick={() => addItem(product, quantity)}
                  className="flex-1 w-full flex items-center justify-center gap-3 bg-secondary text-primary py-4 rounded-2xl font-black text-xl shadow-xl shadow-black/20 hover:bg-white transition-all active:scale-[0.98]"
                >
                  <ShoppingBag size={24} />
                  إضافة للسلة
                </button>
              </div>
            </div>

            {/* Delivery & Returns Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:pt-10">
              <div className="flex items-center gap-3 sm:flex-col sm:text-center sm:gap-2">
                <div className="w-10 h-10 bg-white/10 text-secondary rounded-full flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <span className="text-sm font-bold text-white/90">توصيل سريع لكافة المحافظات</span>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:text-center sm:gap-2">
                <div className="w-10 h-10 bg-white/10 text-secondary rounded-full flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <span className="text-sm font-bold text-white/90">تبديل سهل خلال 3 أيام</span>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:text-center sm:gap-2">
                <div className="w-10 h-10 bg-white/10 text-secondary rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-bold text-white/90">جودة مضمونة 100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <section className="mt-24 sm:mt-32">
          <div className="flex items-center justify-between mb-10 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl font-black text-primary border-r-8 border-secondary pr-6 leading-tight">
              منتجات قد تعجبك
            </h2>
            <Link href="/shop" className="text-secondary font-black hover:underline flex items-center gap-2 text-lg">
              عرض الكل
              <ArrowRight size={20} className="rotate-180" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {relatedProducts.map((prod, idx) => (
              <ProductCard key={prod.id} product={prod} index={idx} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default function ProductPage() {
  return (
    <div className="min-h-screen bg-[#FDF4E3]">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      }>
        <ProductDetails />
      </Suspense>
    </div>
  );
}
