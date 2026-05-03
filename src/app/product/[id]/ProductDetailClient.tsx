"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
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
  ArrowRight,
  PackageX,
  AlertTriangle
} from "lucide-react";
import { Product } from "@/types/models/product";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import ProductCard from "@/components/product/ProductCard";
import { useRef } from "react";

interface ProductDetailClientProps {
  product: Product;
  relatedProducts: Product[];
}

export default function ProductDetailClient({ product, relatedProducts }: ProductDetailClientProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<{ name: string; code: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const variantsRef = useRef<HTMLDivElement>(null);
  
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);

    // Track product view (once per session per product to avoid spamming)
    const trackedKey = `tracked_view_${product.id}`;
    if (!sessionStorage.getItem(trackedKey)) {
      fetch(`/api/products/${product.id}/view`, { method: "POST" })
        .then(res => {
          if (res.ok) sessionStorage.setItem(trackedKey, "true");
        })
        .catch(console.error);
    }
  }, [product.id]);

  const [activeImage, setActiveImage] = useState(product.image);

  const isFavorited = mounted ? isInWishlist(product.id) : false;
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const allImages = product.images && product.images.length > 0 ? product.images : [product.image];

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
              src={activeImage} 
              alt={product.name} 
              fill 
              sizes="(max-width: 1024px) 100vw, 800px"
              className="object-cover transition-opacity duration-300"
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
              <div className="absolute top-6 right-6 bg-secondary text-white font-black px-4 py-1.5 rounded-full shadow-lg text-sm z-10">
                جديد
              </div>
            )}
          </motion.div>

          {/* Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative w-20 h-24 sm:w-24 sm:h-28 rounded-2xl overflow-hidden flex-shrink-0 border-2 sm:border-[3px] transition-all ${activeImage === img ? 'border-secondary shadow-md opacity-100' : 'border-transparent opacity-50 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`${product.name} ${idx + 1}`} fill sizes="100px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info */}
        <div className="lg:col-span-5 bg-primary text-white dark:text-primary-foreground p-8 sm:p-10 rounded-[2.5rem] sm:rounded-[4rem] shadow-2xl relative overflow-hidden border border-white/10">
          {/* Decorative background element */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-secondary/10 blur-[100px] -ml-32 -mt-32" />
          
          <div className="relative z-10 space-y-8 sm:space-y-10">
            <div className="space-y-4 sm:space-y-6">
                <div className="flex items-center gap-4">
                  <span className="bg-white/10 text-white dark:text-secondary text-xs sm:text-sm font-black px-4 py-1.5 rounded-full tracking-widest uppercase backdrop-blur-md">
                    {product.category}
                  </span>
                </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white dark:text-primary-foreground leading-tight">
                {product.name}
              </h1>

              <div className="flex items-baseline gap-4">
                <p className="text-3xl sm:text-4xl font-black text-secondary">
                  {product.price.toFixed(2)} د.ا
                </p>
                {product.isNew && (
                  <p className="text-lg text-primary-foreground/40 line-through font-bold">
                    {(product.price * 1.25).toFixed(2)} د.ا
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center gap-3">
                {isOutOfStock ? (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-2 rounded-xl font-bold text-sm">
                    <PackageX size={18} />
                    نفذت الكمية
                  </div>
                ) : isLowStock ? (
                  <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-4 py-2 rounded-xl font-bold text-sm">
                    <AlertTriangle size={18} />
                    كمية محدودة ({product.stock} قطعة متاحة)
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl font-bold text-sm">
                    <ShieldCheck size={18} />
                    متوفر في المخزون
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <h3 className="text-xl font-black text-secondary border-r-4 border-secondary pr-4">وصف المنتج</h3>
              <p className="text-lg text-primary-foreground/80 leading-relaxed font-medium">
                {product.description || `تمتع بالأناقة والراحة مع ${product.name}. صُمم هذا المنتج خصيصاً ليناسب نمط حياة المبرمجين والمبدعين، حيث يجمع بين الجودة العالية في التصنيع والشكل العصري الذي يعكس هويتك التقنية. خامات قطنية 100% تضمن لك الراحة طوال اليوم.`}
              </p>
            </div>

            {/* Variants Selection */}
            <div ref={variantsRef} className="space-y-6 pt-2">
              {/* Color Selection */}
              {product.hasColors && product.colors && product.colors.length > 0 && (
                <div className={`space-y-4 p-4 rounded-3xl transition-all duration-300 ${showError && !selectedColor ? 'bg-red-500/10 border-2 border-red-500/50' : 'bg-transparent border-2 border-transparent'}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white dark:text-primary-foreground flex items-center gap-2">
                      الألوان المتاحة
                      {selectedColor && <span className="text-secondary text-sm font-bold">({selectedColor.name})</span>}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color.code}
                        onClick={() => {
                          setSelectedColor(color);
                          setShowError(false);
                        }}
                        className={`w-10 h-10 rounded-full border-2 transition-all p-0.5 ${
                          selectedColor?.code === color.code 
                            ? "border-secondary scale-110 shadow-lg" 
                            : "border-white/10 hover:border-white/40"
                        }`}
                        title={color.name}
                      >
                        <div 
                          className="w-full h-full rounded-full" 
                          style={{ backgroundColor: color.code }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {product.hasSizes && product.sizes && product.sizes.length > 0 && (
                <div className={`space-y-4 p-4 rounded-3xl transition-all duration-300 ${showError && !selectedSize ? 'bg-red-500/10 border-2 border-red-500/50' : 'bg-transparent border-2 border-transparent'}`}>
                  <h3 className="text-lg font-black text-white dark:text-primary-foreground flex items-center gap-2">
                    المقاس
                    {selectedSize && <span className="text-secondary text-sm font-bold">({selectedSize})</span>}
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => {
                          setSelectedSize(size);
                          setShowError(false);
                        }}
                        className={`min-w-[50px] px-4 py-2 rounded-xl font-bold text-sm transition-all border-2 ${
                          selectedSize === size
                            ? "bg-secondary text-secondary-foreground border-secondary shadow-lg scale-105"
                            : "bg-white/5 border-white/10 text-white dark:text-primary-foreground hover:border-white/40"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {showError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-xl text-sm font-bold flex items-center gap-2"
                >
                  <AlertTriangle size={18} />
                  يرجى اختيار اللون والمقاس أولاً
                </motion.div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                {/* Quantity Selector */}
                <div className={`flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-1 w-full sm:w-auto ${isOutOfStock ? 'opacity-50 pointer-events-none' : ''}`}>
                  <button 
                    onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                    className="w-12 h-12 flex items-center justify-center text-white dark:text-primary-foreground hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-black text-xl text-white dark:text-primary-foreground">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                    className="w-12 h-12 flex items-center justify-center text-white dark:text-primary-foreground hover:bg-white/10 rounded-xl transition-all"
                  >
                    <Plus size={20} />
                  </button>
                </div>

                {/* Add to Cart Button */}
                {isOutOfStock ? (
                  <div className="flex-1 w-full flex items-center justify-center gap-3 bg-red-500/20 text-red-400 py-4 rounded-2xl font-black text-xl border border-red-500/20">
                    <PackageX size={24} />
                    نفذت الكمية
                  </div>
                ) : (
                  <button 
                    onClick={() => {
                      if ((product.hasColors && !selectedColor) || (product.hasSizes && !selectedSize)) {
                        setShowError(true);
                        variantsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        return;
                      }
                      addItem({
                        ...product,
                        selectedColor: selectedColor || undefined,
                        selectedSize: selectedSize || undefined
                      }, quantity);
                    }}
                    className="flex-1 w-full flex items-center justify-center gap-3 bg-secondary text-secondary-foreground py-4 rounded-2xl font-black text-xl shadow-xl shadow-black/20 hover:bg-white hover:text-secondary hover:border-secondary transition-all active:scale-[0.98] border border-transparent"
                  >
                    <ShoppingBag size={24} />
                    إضافة للسلة
                  </button>
                )}
              </div>
            </div>

            {/* Delivery & Returns Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-white/10 pt-8 sm:pt-10">
              <div className="flex items-center gap-3 sm:flex-col sm:text-center sm:gap-2">
                <div className="w-10 h-10 bg-white/10 text-secondary rounded-full flex items-center justify-center">
                  <Truck size={20} />
                </div>
                <span className="text-sm font-bold text-primary-foreground/90">توصيل سريع لكافة المحافظات</span>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:text-center sm:gap-2">
                <div className="w-10 h-10 bg-white/10 text-secondary rounded-full flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <span className="text-sm font-bold text-primary-foreground/90">تبديل سهل خلال 3 أيام</span>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:text-center sm:gap-2">
                <div className="w-10 h-10 bg-white/10 text-secondary rounded-full flex items-center justify-center">
                  <ShieldCheck size={20} />
                </div>
                <span className="text-sm font-bold text-primary-foreground/90">جودة مضمونة 100%</span>
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
