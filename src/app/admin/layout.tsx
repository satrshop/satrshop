"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { subscribeToUnreadCount } from "@/lib/db/messages";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  LogOut, 
  Loader2,
  Menu,
  X,
  ChevronLeft,
  Mail,
  Users,
  Warehouse
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AdminHelp from "@/components/admin/AdminHelp";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = subscribeToUnreadCount((count) => {
      setUnreadCount(count);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Session Duration Check (1 Hour)
        const sessionStart = localStorage.getItem("adminSessionStart");
        if (sessionStart && Date.now() - parseInt(sessionStart) > 3600000) {
          await signOut(auth);
          localStorage.removeItem("adminSessionStart");
          router.push("/admin/login?error=expired");
          setLoading(false);
          return;
        }


      } else if (pathname !== "/admin/login") {
        router.push("/admin/login");
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
    { name: "المخزون", href: "/admin/inventory", icon: Warehouse },
    { name: "الطلبات", href: "/admin/orders", icon: ShoppingBag },
    { name: "الزبائن", href: "/admin/customers", icon: Users },
    { name: "الرسائل", href: "/admin/messages", icon: Mail },
  ];

  return (
    <div className="light min-h-screen bg-[#0f172a] text-white flex print:bg-white print:text-black print:block selection:bg-secondary selection:text-primary">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-72 flex-col bg-[#1e293b] border-l border-white/5 sticky top-0 h-screen print:hidden">
        <div className="p-8 border-b border-white/5 flex flex-col items-center">
          <Link href="/">
            <Image src="/images/whitelogo.png" alt="Satr Shop" width={100} height={32} className="w-auto h-auto mb-2" />
          </Link>
          <span className="text-[10px] bg-secondary text-primary px-3 py-0.5 rounded-full font-black uppercase tracking-widest">
            إدارة المتجر
          </span>
        </div>

        <nav className="flex-1 p-6 space-y-3">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ x: -8, backgroundColor: isActive ? "" : "rgba(255, 255, 255, 0.03)" }}
                  whileTap={{ scale: 0.98 }}
                  className={`relative flex items-center gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                    isActive 
                      ? "bg-gradient-to-r from-secondary to-secondary/80 text-primary shadow-xl shadow-secondary/20" 
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-primary/40 rounded-l-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <item.icon size={22} className={isActive ? "scale-110" : "opacity-30 group-hover:opacity-100"} />
                  <span className="tracking-wide text-[15px] flex-1">{item.name}</span>
                  {item.href === "/admin/messages" && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-pulse shadow-lg shadow-rose-500/20">
                      {unreadCount}
                    </span>
                  )}
                  {isActive && <ChevronLeft size={18} className="mr-0 rotate-180 opacity-50" />}
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
        <header className="lg:hidden h-20 bg-[#1e293b] border-b border-white/10 flex items-center justify-between px-6 sticky top-0 z-40 print:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-white/80">
            <Menu size={24} />
          </button>
          <Image src="/images/whitelogo.png" alt="Logo" width={80} height={20} className="w-auto h-auto" />
          <div className="w-10" /> {/* Spacer */}
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 sm:p-10 lg:p-12 print:p-0">
          {children}
        </main>
      </div>

      <AdminHelp />

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
              <nav className="flex-1 p-6 space-y-3 text-right">
                {navItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link key={item.name} href={item.href} onClick={() => setIsSidebarOpen(false)}>
                      <div className={`flex items-center justify-end gap-4 px-6 py-4 rounded-2xl font-black transition-all ${
                        isActive ? "bg-secondary text-primary shadow-lg" : "text-white/40"
                      }`}>
                        {item.href === "/admin/messages" && unreadCount > 0 && (
                          <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-lg shadow-rose-500/20">
                            {unreadCount}
                          </span>
                        )}
                        <span className="text-lg flex-1">{item.name}</span>
                        <item.icon size={24} className={isActive ? "" : "opacity-30"} />
                      </div>
                    </Link>
                  );
                })}
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
