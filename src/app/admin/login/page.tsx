"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();
  const unauthorizedError = searchParams.get("error") === "unauthorized";

  useEffect(() => {
    if (unauthorizedError) {
      setError("ليس لديك صلاحيات للوصول إلى لوحة التحكم.");
    } else if (searchParams.get("error") === "expired") {
      setError("انتهت مدة الجلسة (ساعة واحدة). يرجى تسجيل الدخول مرة أخرى.");
    }
  }, [unauthorizedError, searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/admin");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      localStorage.setItem("adminSessionStart", Date.now().toString());
      router.push("/admin");
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError("فشل تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <Image src="/images/whitelogo.png" alt="Satr Logo" width={100} height={30} className="w-auto h-auto" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">لوحة التحكم</h1>
          <p className="text-white/60 font-bold">يرجى تسجيل الدخول للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-white/80 text-sm font-bold mr-2 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@satrshop.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-white/20 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/80 text-sm font-bold mr-2 block">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-white/20 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all"
              />
            </div>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/20 border border-red-500/50 text-red-200 p-4 rounded-xl flex items-center gap-3 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-primary py-4 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-xl shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "دخول"}
          </button>
        </form>

        <p className="mt-8 text-center text-white/40 text-xs font-bold uppercase tracking-widest">
          Satar Shop Administrative Console
        </p>
      </motion.div>
    </div>
  );
}
