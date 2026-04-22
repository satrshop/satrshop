"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, AlertCircle, CheckCircle2 } from "lucide-react";

export default function AdminRegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Create the user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Activate admin via server-side API
      const idToken = await userCredential.user.getIdToken();
      const response = await fetch("/api/admin/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      });

      const resData = await response.json();

      if (!response.ok) {
        // If server rejects, sign out the newly created user
        await auth.signOut();
        throw new Error(resData.error || "حدث خطأ أثناء التسجيل.");
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        router.push("/admin");
      }, 2000);

    } catch (err: unknown) {
      // FIX-12: Generic error messages to prevent email enumeration
      if (err instanceof Error && "code" in err) {
        const firebaseErr = err as { code: string };
        if (firebaseErr.code === "auth/weak-password") {
          setError("كلمة المرور ضعيفة جداً. يرجى استخدام 6 أحرف على الأقل.");
        } else {
          setError("حدث خطأ أثناء التسجيل. يرجى التواصل مع المسؤول.");
        }
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("حدث خطأ أثناء التسجيل. يرجى التواصل مع المسؤول.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/10 text-center space-y-4 flex flex-col items-center"
        >
          <CheckCircle2 className="text-emerald-400 w-16 h-16" />
          <h2 className="text-2xl font-black text-white">تم تفعيل الحساب بنجاح!</h2>
          <p className="text-white/60">جاري تحويلك إلى لوحة التحكم...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px] -mr-64 -mt-64" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -ml-64 -mb-64" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/40 backdrop-blur-2xl border border-primary/10 p-8 sm:p-10 rounded-[3rem] shadow-[0_20px_50px_-12px_rgba(44,106,135,0.12)] relative z-10"
      >
        <div className="text-center mb-8">
          <div className="mb-6 flex justify-center">
            <Image src="/images/whitelogo.png" alt="Satr Logo" width={100} height={30} className="w-auto h-auto" />
          </div>
          <h1 className="text-2xl font-black text-primary mb-2">تفعيل حساب الإدارة</h1>
          <p className="text-primary/60 font-bold">أدخل بريدك المدعو وقم بإنشاء كلمة مرور</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-primary/80 text-sm font-bold mr-2 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@satrshop.com"
                className="w-full bg-white/50 border border-primary/10 rounded-2xl py-4 pr-12 pl-4 text-primary placeholder:text-primary/20 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all font-bold text-left"
                dir="ltr"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-primary/80 text-sm font-bold mr-2 block">كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/30" size={20} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                className="w-full bg-white/50 border border-primary/10 rounded-2xl py-4 pr-12 pl-4 text-primary placeholder:text-primary/20 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/5 transition-all"
              />
            </div>
            <p className="text-xs text-primary/40 mr-2">يجب أن تتكون من 6 أحرف على الأقل</p>
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-600 p-4 rounded-xl flex items-start gap-3 text-sm font-bold"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-4 rounded-2xl font-black text-lg hover:bg-primary transition-all shadow-xl shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : "تفعيل الحساب والدخول"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push("/admin/login")}
            className="text-primary/60 hover:text-secondary font-bold text-sm underline underline-offset-4"
          >
            لدي حساب مفعل بالفعل، أريد تسجيل الدخول
          </button>
        </div>
      </motion.div>
    </div>
  );
}
