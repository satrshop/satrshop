"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore, getCartItemKey } from "@/store/useCartStore";
import { useEffect, useState } from "react";

export default function CartDrawer() {
  const { isOpen, setIsOpen, items, removeItem, updateQuantity } = useCartStore();
  
  // Fix hydration mismatch for zustand persist
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#163644]/40 backdrop-blur-sm z-[60]"
          />

          {/* Drawer (Sliding from Left for RTL layout) */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-full w-full sm:w-[400px] bg-background z-[70] shadow-2xl flex flex-col border-r border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3 text-foreground font-bold text-xl">
                <ShoppingBag className="text-secondary" />
                حقيبة التسوق
                <span className="bg-primary/10 text-primary text-sm px-2 py-0.5 rounded-full">{items.length}</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 bg-muted text-muted-foreground rounded-full hover:bg-red-50 hover:text-red-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                  <ShoppingBag size={64} className="text-muted-foreground" />
                  <p className="text-lg font-bold text-foreground">الحقيبة فارغة حالياً</p>
                  <p className="text-sm text-muted-foreground">تصفح تشكيلة سطر وأضف ما يعجبك!</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div 
                    layout 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    key={getCartItemKey(item)} 
                    className="flex gap-4 bg-primary text-primary-foreground p-3 rounded-2xl border border-primary/20 shadow-sm group"
                  >
                    <div className="relative w-20 h-24 rounded-xl overflow-hidden bg-white flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="100px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-primary-foreground line-clamp-1 text-sm">{item.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.selectedColor && (
                              <div className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded-md border border-white/10">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.selectedColor.code }} />
                                <span className="text-[10px] text-white/60">{item.selectedColor.name}</span>
                              </div>
                            )}
                            {item.selectedSize && (
                              <div className="flex items-center bg-white/5 px-1.5 py-0.5 rounded-md border border-white/10">
                                <span className="text-[10px] text-white/60">{item.selectedSize}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button 
                          onClick={() => removeItem(getCartItemKey(item))}
                          className="text-primary-foreground/70 hover:text-red-400 transition-colors ml-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="font-extrabold text-secondary">{item.price.toFixed(2)} د.ا</p>
                        
                        <div className="flex items-center gap-3 bg-white/10 dark:bg-black/10 rounded-full px-2 py-1">
                          <button 
                             onClick={() => {
                               if (item.quantity === 1) {
                                 removeItem(getCartItemKey(item));
                               } else {
                                 updateQuantity(getCartItemKey(item), item.quantity - 1);
                               }
                             }}
                             className="text-primary-foreground hover:text-secondary transition"
                          >
                             <Minus size={14} />
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button 
                             onClick={() => updateQuantity(getCartItemKey(item), item.quantity + 1)}
                             className="text-primary-foreground hover:text-secondary transition"
                          >
                             <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer / Checkout */}
            {items.length > 0 && (
              <div className="p-6 bg-primary text-primary-foreground border-t border-primary/20 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                <div className="flex justify-between items-center mb-4 text-lg font-bold">
                  <span className="text-primary-foreground/80">الإجمالي:</span>
                  <span className="text-2xl text-secondary">{total.toFixed(2)} د.ا</span>
                </div>
                <Link 
                  href="/checkout" 
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-secondary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-[#a87d2b] transition-colors shadow-lg shadow-secondary/20 flex items-center justify-center gap-2"
                >
                  إتمام الطلب
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
