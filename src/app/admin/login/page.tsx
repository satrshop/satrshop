"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, AlertCircle, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // FIX-10: Email verification is bypassed for now to allow old admin accounts to login.
      // if (!userCredential.user.emailVerified) {
      //   await auth.signOut();
      //   setError("يرجى تفعيل بريدك الإلكتروني أولاً. تحقق من صندوق الوارد.");
      //   setLoading(false);
      //   return;
      // }

      // Verify admin status server-side and log login
      const idToken = await userCredential.user.getIdToken();
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({ isLogin: true }),
      });

      if (!response.ok) {
        await auth.signOut();
        setError("حسابك غير مسجل كمدير، أو أنه قيد الانتظار بانتظار تفعيل المدير الرئيسي.");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminSessionStart", Date.now().toString());
      router.push("/admin");
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError("فشل تسجيل الدخول. يرجى التأكد من البريد الإلكتروني وكلمة المرور.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      setError("الرجاء إدخال البريد الإلكتروني أولاً في الحقل المخصص لإرسال رابط استعادة كلمة المرور.");
      return;
    }
    
    setLoading(true);
    setError("");
    setResetSent(false);
    
    try {
      await sendPasswordResetEmail(auth, email);
      
      // Log the activity securely on the server
      await fetch("/api/admin/auth/log-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      setResetSent(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("لا يوجد حساب مسجل بهذا البريد الإلكتروني.");
      } else {
        setError("فشل إرسال رابط استعادة كلمة المرور. يرجى المحاولة لاحقاً.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1e293b] border border-white/5 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <Image 
              src="/images/whitelogo.png" 
              alt="Satr Logo" 
              width={100} 
              height={30} 
              priority
              className="w-auto h-auto brightness-0 invert opacity-80" 
            />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">لوحة التحكم</h1>
          <p className="text-white/40 font-bold">يرجى تسجيل الدخول للمتابعة</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-white/60 text-sm font-bold mr-2 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@satrshop.com"
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-white/10 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-bold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-white/60 text-sm font-bold mr-2 block">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-black/20 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-white placeholder:text-white/10 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all"
              />
            </div>
            <div className="flex justify-end mt-2">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-sm text-secondary hover:text-white transition-colors font-bold"
              >
                نسيت كلمة المرور؟
              </button>
            </div>
          </div>

          {resetSent && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold leading-relaxed"
            >
              تم إرسال رابط استعادة كلمة المرور بنجاح.
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-center gap-3 text-sm font-bold"
            >
              <AlertCircle size={18} />
              {error}
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-primary py-4 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-xl shadow-secondary/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "دخول"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-white/30 text-sm font-bold">
            ليس لديك حساب؟{" "}
            <Link href="/admin/register" className="text-secondary hover:text-white transition-colors font-black">
              تسجيل حساب جديد
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 flex justify-center">
          <Link 
            href="/" 
            className="flex items-center gap-2 text-white/40 hover:text-secondary transition-all font-bold group"
          >
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            <span>العودة للمتجر</span>
          </Link>
        </div>

        <p className="mt-8 text-center text-white/10 text-[10px] font-black uppercase tracking-widest">
          Satr Shop Administrative Console
        </p>
      </motion.div>
    </div>
  );
}
