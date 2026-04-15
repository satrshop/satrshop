"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ShoppingBag, Star } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-primary rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-primary/20"
    >
      {/* Badges */}
      {product.isNew && (
        <div className="absolute top-4 right-4 z-10 bg-secondary text-white text-xs font-extrabold px-3 py-1 rounded-full shadow-md">
          جديد
        </div>
      )}

      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden bg-white/5 border-b border-white/10">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        
        {/* Quick Add Button Overlay */}
        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6 backdrop-blur-[2px]">
          <motion.button 
            onClick={() => addItem(product)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-foreground text-primary px-6 py-3 rounded-full font-bold flex items-center gap-2 shadow-lg hover:bg-secondary hover:text-primary-foreground transition-colors"
          >
            <ShoppingBag size={18} />
            أضف للسلة
          </motion.button>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-secondary font-mono text-xs tracking-widest uppercase">{product.category}</p>
          <div className="flex items-center gap-1 text-secondary">
            <Star size={14} fill="currentColor" />
            <span className="text-sm font-bold text-primary-foreground/90">{product.rating}</span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-primary-foreground mb-3 line-clamp-1 group-hover:text-secondary transition-colors">{product.name}</h3>
        <p className="text-xl font-extrabold text-primary-foreground/90">{product.price.toFixed(2)} د.ا</p>
      </div>
    </motion.div>
  );
}
