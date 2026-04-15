"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, User, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCartStore } from "@/store/useCartStore";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const { scrollY } = useScroll();
  const setIsCartOpen = useCartStore((state) => state.setIsOpen);
  const cartItems = useCartStore((state) => state.items);
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  const navLinks = [
    { name: "الرئيسية", href: "/" },
    { name: "المتجر", href: "/shop" },
    { name: "مجموعاتنا", href: "/collections" },
    { name: "الأسئلة الشائعة", href: "/faq" },
    { name: "تواصل معنا", href: "/contact" },
  ];

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed w-full top-0 z-[40] transition-all duration-300 items-center flex bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-sm ${
          isScrolled ? "py-1" : "py-3"
        }`}
      >
        <div className="w-full px-6 md:px-12 flex justify-between items-center">
          {/* Logo (Right in RTL) */}
          <div className="flex-1 flex justify-start">
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} className="relative z-50">
                <Image
                  src="/images/SatrLogo.png"
                  alt="شعار متجر سطر"
                  width={isScrolled ? 50 : 65}
                  height={isScrolled ? 17 : 22}
                  className="object-contain transition-all duration-300 w-auto h-auto dark:hidden block"
                  priority
                />
                <Image
                  src="/images/whitelogo.png"
                  alt="شعار متجر سطر"
                  width={isScrolled ? 50 : 65}
                  height={isScrolled ? 17 : 22}
                  className="object-contain transition-all duration-300 w-auto h-auto hidden dark:block"
                  priority
                />
              </motion.div>
            </Link>
          </div>
          
          {/* Desktop Nav (Center) */}
          <div className="hidden lg:flex flex-none justify-center">
            <nav className="flex items-center gap-5 lg:gap-7 text-base font-bold">
              {navLinks.map((item, i) => (
                <Link key={i} href={item.href} className="relative group overflow-hidden whitespace-nowrap">
                  <span className="text-foreground transition-colors group-hover:text-secondary">{item.name}</span>
                  <span className="absolute bottom-0 right-0 w-0 h-[2px] bg-secondary transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </nav>
          </div>

          {/* Actions (Left in RTL) */}
          <div className="flex-1 flex items-center justify-end gap-3 sm:gap-4 relative">
            <div className="relative flex items-center">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div 
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "160px", padding: "0 10px" }}
                    exit={{ opacity: 0, width: 0, padding: 0 }}
                    className="absolute left-10 flex items-center bg-white border border-border rounded-full overflow-hidden shadow-sm"
                  >
                    <input autoFocus type="text" placeholder="ابحث..." className="w-full bg-transparent px-2 py-1.5 text-sm focus:outline-none" />
                    <button onClick={() => setIsSearchOpen(false)} className="text-muted-foreground hover:text-red-500 transition-colors ml-2">
                      <X size={16} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <motion.button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                whileHover={{ scale: 1.1, rotate: 5 }} 
                whileTap={{ scale: 0.95 }} 
                className="p-2 text-primary hover:text-secondary transition-colors z-10 bg-background/50 rounded-full"
              >
                <Search size={22} className="stroke-[2.5px]" />
              </motion.button>
            </div>

            <ThemeToggle />
            
            <motion.button 
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.1, rotate: -5 }} 
              whileTap={{ scale: 0.95 }} 
              className="p-2 text-primary hover:text-secondary transition-colors relative"
            >
              <ShoppingBag size={22} className="stroke-[2.5px]" />
              {mounted && totalItems > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                  className="absolute top-0 right-0 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white"
                >
                  {totalItems}
                </motion.span>
              )}
            </motion.button>
            
            <div className="h-6 w-px bg-primary/20 hidden sm:block mx-1" />
            
            <Link href="/login">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-full font-bold hover:bg-[#22556d] shadow-md transition-all">
                <User size={18} strokeWidth={2.5}/>
                 دخول
              </motion.button>
            </Link>

            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-primary">
              <Menu size={24} className="stroke-[2.5px]"/>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-primary/80 backdrop-blur-md z-[50] md:hidden"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-background z-[60] shadow-2xl flex flex-col p-6 md:hidden"
            >
              <div className="flex items-center justify-between mb-12">
                <Image src="/images/SatrLogo.png" alt="Satr Shop" width={80} height={25} className="w-auto h-auto" />
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-muted text-muted-foreground rounded-full hover:bg-red-50 hover:text-red-500">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-6">
                {navLinks.map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-2xl font-bold text-foreground border-b border-border pb-4 hover:text-primary transition-colors"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="mt-auto pt-6">
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <button className="w-full flex items-center justify-center gap-2 bg-primary text-white py-4 rounded-xl font-bold text-lg hover:bg-secondary transition-colors">
                    <User size={20} />
                    تسجيل الدخول / إنشاء حساب
                  </button>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
