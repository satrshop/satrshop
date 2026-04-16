"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Loader2,
  Menu,
  X,
  ChevronLeft,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router, pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
      </div>
    );
  }

  // Don't show layout on login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }
  const navItems = [
    { name: "الإحصائيات", href: "/admin", icon: LayoutDashboard },
    { name: "المنتجات", href: "/admin/products", icon: Package },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "الرسائل", href: "/admin/messages", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#1e293b] border-l border-white/5 sticky top-0 h-screen">
        <div className="p-8 border-b border-white/5 flex flex-col items-center">
          <Link href="/">
            <Image src="/images/whitelogo.png" alt="Satr Shop" width={100} height={32} className="w-auto h-auto mb-2" />
          </Link>
          <span className="text-[10px] bg-secondary text-primary px-3 py-0.5 rounded-full font-black uppercase tracking-widest">
            إدارة المتجر
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  whileHover={{ x: -10 }}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                    isActive 
                      ? "bg-secondary text-primary shadow-lg shadow-secondary/10" 
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <item.icon size={22} />
                  <span>{item.name}</span>
                  {isActive && <ChevronLeft size={18} className="mr-auto rotate-180" />}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={22} />
            خروج من الإدارة
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar - Mobile */}
        <header className="lg:hidden h-20 bg-[#1e293b] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white/80">
            <Menu size={24} />
          </button>
          <Image src="/images/whitelogo.png" alt="Logo" width={80} height={20} className="w-auto h-auto" />
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 lg:p-12">
          {children}
        </main>
      </div>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[50]"
            />
            <motion.aside
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-[80%] max-w-sm bg-[#1e293b] z-[60] shadow-2xl flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-white/5">
                <Image src="/images/whitelogo.png" alt="Logo" width={80} height={20} className="w-auto h-auto" />
                <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-white/60">
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 p-6 space-y-2 text-right">
                {navItems.map((item) => (
                  <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                    <div className={`flex items-center justify-end gap-4 px-5 py-4 rounded-2xl font-bold ${
                      pathname === item.href ? "bg-secondary text-primary" : "text-white/60"
                    }`}>
                      <span>{item.name}</span>
                      <item.icon size={22} />
                    </div>
                  </Link>
                ))}
              </nav>
              <div className="p-6 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-end gap-4 px-5 py-4 rounded-2xl font-bold text-red-400"
                >
                  <span>خروج</span>
                  <LogOut size={22} />
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
