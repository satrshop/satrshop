"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Heart } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { useState, useEffect } from "react";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    isNew?: boolean;
  };
  index: number;
}

export default function ProductCard({ product, index }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isFavorited = mounted ? isInWishlist(product.id) : false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-primary rounded-2xl sm:rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-primary/20 flex flex-col h-full"
    >
      {/* Badges */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex flex-col gap-2">
        {product.isNew && (
          <div className="bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-extrabold px-2 sm:px-3 py-1 rounded-full shadow-md">
            جديد
          </div>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20 w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 text-white hover:bg-white/20 transition-all"
      >
        <Heart 
          size={18} 
          className={isFavorited ? "fill-secondary text-secondary" : "text-white"} 
        />
      </button>

      {/* Image Area - Linked to Product Page */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/5] overflow-hidden bg-white/5 border-b border-white/10 cursor-pointer">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Quick Add Button Overlay (Desktop Only) */}
        <div className="hidden sm:flex absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 items-end justify-center pb-6 backdrop-blur-[2px]">
          <motion.button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addItem(product);
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-foreground text-primary dark:text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-secondary hover:text-white transition-colors"
          >
            <ShoppingBag size={18} />
            أضف للسلة
          </motion.button>
        </div>
      </Link>

      {/* Content Area */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="block flex-1 cursor-pointer">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <p className="text-secondary font-mono text-[10px] sm:text-xs tracking-widest uppercase truncate">{product.category}</p>
            <div className="flex items-center gap-0.5 sm:gap-1 text-secondary flex-shrink-0">
              <Star size={12} className="sm:w-[14px] sm:h-[14px]" fill="currentColor" />
              <span className="text-xs sm:text-sm font-bold text-primary-foreground/90">{product.rating}</span>
            </div>
          </div>
          <h3 className="text-sm sm:text-lg font-bold text-primary-foreground mb-1.5 sm:mb-3 line-clamp-2 h-10 sm:h-14 group-hover:text-secondary transition-colors leading-tight">{product.name}</h3>
          <p className="text-base sm:text-xl font-extrabold text-primary-foreground/90 mb-3">{product.price.toFixed(2)} د.ا</p>
        </Link>

        {/* Mobile-Only Add to Cart Button */}
        <div className="sm:hidden mt-auto">
          <button 
            onClick={() => addItem(product)}
            className="w-full bg-secondary text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all text-sm"
          >
            <ShoppingBag size={16} />
            أضف للسلة
          </button>
        </div>
      </div>
    </motion.div>
  );
}
