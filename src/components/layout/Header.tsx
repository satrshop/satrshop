"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useScroll, AnimatePresence } from "framer-motion";
import { ShoppingBag, Search, Menu, X, ArrowLeft, Loader2, Heart } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { searchProductsRemote } from "@/lib/db/products";
import { Product } from "@/types/models/product";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { scrollY } = useScroll();
  const setIsCartOpen = useCartStore((state) => state.setIsOpen);
  const cartItems = useCartStore((state) => state.items);
  const wishlistItems = useWishlistStore((state) => state.items);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalWishlistItems = wishlistItems.length;

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50);
    });
  }, [scrollY]);

  // Lock body scroll when mobile menu or search is open
  useEffect(() => {
    if (isMobileMenuOpen || isSearchOpen) {
      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.touchAction = "";
    };
  }, [isMobileMenuOpen, isSearchOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Live search as user types (with remote fetch)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchProductsRemote(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce for database queries

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const closeSearch = useCallback(() => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setIsSearching(false);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
    }
  }, [searchQuery, router, closeSearch]);

  const handleResultClick = useCallback(() => {
    closeSearch();
  }, [closeSearch]);

  // Close search on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSearchOpen) {
        closeSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, closeSearch]);

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
          isScrolled ? "py-1.5" : "py-3"
        }`}
      >
        <div className="w-full px-4 sm:px-6 md:px-12 flex justify-between items-center">
          {/* Logo (Right in RTL) */}
          <div className="flex-1 flex justify-start">
            <Link href="/">
              <motion.div whileHover={{ scale: 1.05 }} className="relative z-50">
                <Image
                  src="/images/SatrLogo.png"
                  alt="شعار متجر سطر"
                  width={isScrolled ? 48 : 56}
                  height={isScrolled ? 16 : 20}
                  className="object-contain transition-all duration-300 w-auto h-auto dark:hidden block"
                  priority
                />
                <Image
                  src="/images/whitelogo.png"
                  alt="شعار متجر سطر"
                  width={isScrolled ? 48 : 56}
                  height={isScrolled ? 16 : 20}
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
          <div className="flex-1 flex items-center justify-end gap-2 sm:gap-3 md:gap-4 relative">
            <motion.button
              onClick={() => setIsSearchOpen(true)}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-primary hover:text-secondary transition-colors z-10 bg-background/50 rounded-full"
              aria-label="بحث"
            >
              <Search size={20} className="sm:w-[22px] sm:h-[22px] stroke-[2.5px]" />
            </motion.button>

            <ThemeToggle />

            <Link href="/wishlist">
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-primary hover:text-secondary transition-colors relative"
              >
                <Heart size={20} className="sm:w-[22px] sm:h-[22px] stroke-[2.5px]" />
                {mounted && totalWishlistItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white"
                  >
                    {totalWishlistItems}
                  </motion.span>
                )}
              </motion.button>
            </Link>

            <motion.button
              onClick={() => setIsCartOpen(true)}
              whileHover={{ scale: 1.1, rotate: -5 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-primary hover:text-secondary transition-colors relative"
            >
              <ShoppingBag size={20} className="sm:w-[22px] sm:h-[22px] stroke-[2.5px]" />
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



            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-primary active:scale-90 transition-transform touch-manipulation">
              <Menu size={24} className="stroke-[2.5px]" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* ===== SEARCH OVERLAY ===== */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-xl flex flex-col"
            style={{ willChange: "opacity" }}
          >
            {/* Search Header */}
            <div className="w-full px-4 sm:px-6 md:px-12 py-4 border-b border-primary/10">
              <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={closeSearch}
                  className="p-2 text-muted-foreground hover:text-red-500 transition-colors rounded-full flex-shrink-0 touch-manipulation"
                  aria-label="إغلاق البحث"
                >
                  <X size={24} />
                </button>

                <div className="flex-1 flex items-center bg-primary/5 border border-primary/15 rounded-2xl px-4 py-3 gap-3 focus-within:border-secondary focus-within:ring-2 focus-within:ring-secondary/20 transition-all">
                  <Search size={20} className="text-muted-foreground flex-shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="ابحث عن منتج أو فئة..."
                    className="w-full bg-transparent text-foreground text-base sm:text-lg font-medium focus:outline-none placeholder:text-muted-foreground/60"
                    autoComplete="off"
                  />
                  {isSearching && (
                    <Loader2 size={18} className="text-primary animate-spin flex-shrink-0" />
                  )}
                  {searchQuery && !isSearching && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  className="hidden sm:flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-2xl font-bold hover:bg-[#22556d] transition-colors flex-shrink-0"
                >
                  بحث
                </button>
              </form>
            </div>

            {/* Search Results */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 md:px-12 py-6">
              <div className="max-w-2xl mx-auto">
                {searchQuery.trim() === "" ? (
                  /* Empty State - suggestions */
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                      <Search size={36} className="text-muted-foreground/50" />
                    </div>
                    <p className="text-lg font-bold text-foreground">ابحث في متجر سطر</p>
                    <p className="text-muted-foreground text-sm">ابحث عن هوديز، تيشرتات، جواكيت، إكسسوارات وغيرها...</p>

                    {/* Quick category suggestions */}
                    <div className="flex flex-wrap justify-center gap-2 pt-4">
                      {["هوديز تقنية", "تيشرتات", "جواكيت", "إكسسوارات", "حقائب"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSearchQuery(cat)}
                          className="px-4 py-2 bg-primary text-white font-bold text-sm rounded-full shadow-sm border border-primary hover:bg-[#22556d] transition-all touch-manipulation"
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  /* Results found */
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-4">
                      نتائج البحث عن &quot;{searchQuery}&quot; ({searchResults.length} منتج)
                    </p>
                    <div className="flex flex-col gap-3">
                      {searchResults.map((product) => (
                        <Link
                          key={product.id}
                          href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                          onClick={handleResultClick}
                          className="block"
                        >
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-4 p-3 sm:p-4 bg-primary text-white rounded-2xl border border-primary/20 hover:bg-[#22556d] hover:border-secondary/30 hover:shadow-md transition-all group touch-manipulation cursor-pointer"
                          >
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-white/10 flex-shrink-0">
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                sizes="(max-width: 640px) 64px, 80px"
                                className="object-cover" 
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-white group-hover:text-secondary transition-colors truncate text-sm sm:text-base">
                                {product.name}
                              </p>
                              <p className="text-xs sm:text-sm text-white/70 font-medium mt-1">{product.category}</p>
                              <p className="text-base sm:text-lg font-extrabold text-secondary mt-1">{product.price.toFixed(2)} د.ا</p>
                            </div>
                            <ArrowLeft size={18} className="text-white/50 group-hover:text-secondary transition-colors flex-shrink-0" />
                          </motion.div>
                        </Link>
                      ))}
                    </div>

                    {/* View all in shop */}
                    <Link
                      href={`/shop?q=${encodeURIComponent(searchQuery)}`}
                      onClick={handleResultClick}
                    >
                      <motion.div
                        whileHover={{ x: -5 }}
                        className="flex items-center justify-center gap-2 mt-6 py-4 text-primary font-bold hover:text-secondary transition-colors touch-manipulation"
                      >
                        عرض كل النتائج في المتجر
                        <ArrowLeft size={18} />
                      </motion.div>
                    </Link>
                  </div>
                ) : !isSearching ? (
                  /* No results */
                  <div className="text-center py-16 space-y-4">
                    <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                      <Search size={36} className="text-red-300" />
                    </div>
                    <p className="text-lg font-bold text-foreground">لا توجد نتائج</p>
                    <p className="text-muted-foreground text-sm">لم نجد أي منتج مطابق لـ &quot;{searchQuery}&quot;. جرب كلمات مختلفة.</p>
                  </div>
                ) : (
                  /* Searching indicator */
                  <div className="text-center py-16">
                    <Loader2 size={36} className="text-primary animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">جاري البحث...</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MOBILE MENU DRAWER ===== */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMobileMenu}
              className="fixed inset-0 bg-primary/70 z-[50] lg:hidden"
              style={{ willChange: "opacity" }}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
              className="fixed top-0 right-0 h-full w-[85%] max-w-sm bg-background z-[60] shadow-2xl flex flex-col overflow-y-auto lg:hidden"
              style={{ willChange: "transform" }}
            >
              <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border sticky top-0 bg-background z-10">
                <Image src="/images/SatrLogo.png" alt="Satr Shop" width={70} height={22} className="w-auto h-auto dark:hidden block" />
                <Image src="/images/whitelogo.png" alt="Satr Shop" width={70} height={22} className="w-auto h-auto hidden dark:block" />
                <button
                  onClick={closeMobileMenu}
                  className="p-2 bg-muted text-muted-foreground rounded-full hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all touch-manipulation"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col gap-1 p-5 sm:p-6 flex-1">
                {navLinks.map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="text-xl sm:text-2xl font-bold text-foreground border-b border-border py-4 hover:text-primary active:text-secondary transition-colors touch-manipulation"
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>

              <div className="p-5 sm:p-6 border-t border-border">

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
