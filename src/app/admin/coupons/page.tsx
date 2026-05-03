"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ticket,
  Plus,
  Trash2,
  Loader2,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Percent,
  Hash,
  Sparkles,
  X,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/ToastProvider";
import { adminFetch } from "@/lib/api/admin-client";

interface CouponData {
  id: string;
  code: string;
  discountPercent: number;
  maxUses: number;
  usedCount: number;
  isActive: boolean;
  expiresAt?: { _seconds: number; _nanoseconds: number };
  createdAt: { _seconds: number; _nanoseconds: number };
}

// ─── Custom Date Picker ──────────────────────────────────────
const ARABIC_MONTHS = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];
const ARABIC_DAYS = ["أحد", "اثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

function DatePickerField({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) return new Date(value);
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0 });

  const { showToast } = useToast();

  // Calculate popup position from trigger button
  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;
    function updatePos() {
      if (!triggerRef.current) return;
      const rect = triggerRef.current.getBoundingClientRect();
      setPopupPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [isOpen]);

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popupRef.current?.contains(e.target as Node)
      ) return;
      setIsOpen(false);
    }
    if (isOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const cells: { day: number; current: boolean; dateStr: string }[] = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    cells.push({ day: d, current: false, dateStr: fmt(new Date(year, month - 1, d)) });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, dateStr: fmt(new Date(year, month, d)) });
  }
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) {
    cells.push({ day: d, current: false, dateStr: fmt(new Date(year, month + 1, d)) });
  }

  function fmt(d: Date) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  const todayStr = fmt(new Date());

  function goPrev() { setViewDate(new Date(year, month - 1, 1)); }
  function goNext() { setViewDate(new Date(year, month + 1, 1)); }

  function selectDate(dateStr: string) {
    onChange(dateStr);
    setIsOpen(false);
  }

  const displayValue = value
    ? new Date(value).toLocaleDateString("ar-JO", { year: "numeric", month: "long", day: "numeric" })
    : "";

  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-white/60 flex items-center gap-2">
        <Calendar size={14} />
        تاريخ الانتهاء (اختياري)
      </label>
      {/* Trigger */}
      <div
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white cursor-pointer focus-within:ring-2 focus-within:ring-secondary/50 focus-within:border-secondary transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-2">
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange("");
              }}
              className="p-0.5 rounded-md hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
          <Calendar size={16} className="text-white/30 group-hover:text-secondary transition-colors" />
        </div>
        <span className={`font-bold ${value ? "text-white" : "text-white/30"}`}>
          {displayValue || "اختر تاريخ الانتهاء"}
        </span>
      </div>

      {/* Calendar Popup - Fixed position to escape overflow:hidden */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popupRef}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{ top: popupPos.top, right: popupPos.right }}
            className="fixed z-[9999] w-[300px] bg-[#151e2d] border border-white/10 rounded-2xl shadow-2xl shadow-black/50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/[0.03] border-b border-white/5 rounded-t-2xl">
              <button type="button" onClick={goNext} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-secondary transition-colors">
                <ChevronRight size={18} />
              </button>
              <h3 className="font-black text-sm text-white">
                {ARABIC_MONTHS[month]} {year}
              </h3>
              <button type="button" onClick={goPrev} className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-secondary transition-colors">
                <ChevronLeft size={18} />
              </button>
            </div>

            {/* Day headers */}
            <div className="grid grid-cols-7 px-2 pt-3 pb-1">
              {ARABIC_DAYS.map((d) => (
                <div key={d} className="text-center text-[10px] font-black text-secondary/60 py-1">{d}</div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 px-2 pb-3 gap-0.5">
              {cells.map((cell, i) => {
                const isSelected = cell.dateStr === value;
                const isToday = cell.dateStr === todayStr;
                const isPast = cell.dateStr < todayStr;
                const disabled = !cell.current || isPast;

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(cell.dateStr)}
                    className={`
                      relative h-9 w-full flex items-center justify-center rounded-lg text-sm font-bold transition-all
                      ${!cell.current ? "text-white/10" : ""}
                      ${cell.current && isPast ? "text-white/15 cursor-not-allowed" : ""}
                      ${cell.current && !isPast && !isSelected ? "text-white/70 hover:bg-secondary/20 hover:text-secondary cursor-pointer" : ""}
                      ${isSelected ? "bg-secondary text-[#0f172a] font-black shadow-lg shadow-secondary/30" : ""}
                      ${isToday && !isSelected ? "ring-1 ring-secondary/40 text-secondary" : ""}
                    `}
                  >
                    {cell.day}
                    {isToday && !isSelected && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-secondary" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-white/[0.03] border-t border-white/5 rounded-b-2xl">
              <button
                type="button"
                onClick={() => { onChange(""); setIsOpen(false); }}
                className="text-[11px] font-bold text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                مسح
              </button>
              <button
                type="button"
                onClick={() => { setViewDate(new Date()); selectDate(todayStr); }}
                className="text-[11px] font-bold text-secondary hover:text-secondary/80 transition-colors px-2 py-1 rounded-lg hover:bg-secondary/10"
              >
                اليوم
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────
export default function CouponsPage() {
  const [coupons, setCoupons] = useState<CouponData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const { showToast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    code: "",
    discountPercent: 10,
    maxUses: 0,
    expiresAt: "",
  });

  function resetForm() {
    setFormData({ code: "", discountPercent: 10, maxUses: 0, expiresAt: "" });
  }

  useEffect(() => {
    loadCoupons();
  }, []);

  async function loadCoupons() {
    try {
      const data = await adminFetch<{ coupons: CouponData[] }>("/api/admin/coupons");
      setCoupons(data.coupons);
    } catch (err: any) {
      console.error("Error loading coupons:", err);
      setError("فشل تحميل أكواد الخصم");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);

    try {
      const payload: Record<string, any> = {
        code: formData.code,
        discountPercent: formData.discountPercent,
        maxUses: formData.maxUses,
      };
      if (formData.expiresAt) {
        payload.expiresAt = formData.expiresAt;
      }

      const data = await adminFetch<{ coupon: CouponData }>("/api/admin/coupons", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      setCoupons(prev => [data.coupon, ...prev]);
      setShowForm(false);
      resetForm();
      showToast("تم إنشاء الكوبون بنجاح", "success");
    } catch (err: any) {
      setError(err.message || "فشل إنشاء كود الخصم");
    } finally {
      setCreating(false);
    }
  }

  async function handleToggle(id: string, currentActive: boolean) {
    try {
      await adminFetch("/api/admin/coupons", {
        method: "PATCH",
        body: JSON.stringify({ id, isActive: !currentActive }),
      });
      setCoupons(prev =>
        prev.map(c => (c.id === id ? { ...c, isActive: !currentActive } : c))
      );
      showToast("تم تحديث حالة الكوبون", "success");
    } catch (err: any) {
      setError(err.message || "فشل تعديل حالة الكود");
    }
  }

  async function executeDelete(id: string) {
    setDeletingId(id);

    try {
      await adminFetch(`/api/admin/coupons?id=${id}`, { method: "DELETE" });
      setCoupons(prev => prev.filter(c => c.id !== id));
      showToast("تم حذف الكوبون بنجاح", "success");
    } catch (err: any) {
      setError(err.message || "فشل حذف كود الخصم");
    } finally {
      setDeletingId(null);
      setCouponToDelete(null);
    }
  }

  function handleCopy(code: string, id: string) {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showToast("تم نسخ الكود بنجاح", "success");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function generateRandomCode() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "SATR";
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  }

  function formatDate(ts: { _seconds: number } | undefined) {
    if (!ts) return "—";
    return new Date(ts._seconds * 1000).toLocaleDateString("ar-JO", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function isExpired(ts: { _seconds: number } | undefined) {
    if (!ts) return false;
    return new Date(ts._seconds * 1000) < new Date();
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        <p className="text-white/60 font-bold">جاري تحميل أكواد الخصم...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-3">
            <Ticket className="text-secondary" size={32} />
            أكواد الخصم
          </h1>
          <p className="text-white/60 font-bold mt-1">إنشاء وإدارة أكواد الخصم للمنتجات</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm shadow-lg transition-all ${
            showForm
              ? "bg-white/10 text-white/60 border border-white/10"
              : "bg-secondary text-primary shadow-secondary/30"
          }`}
        >
          {showForm ? (
            <>
              <X size={18} />
              إلغاء
            </>
          ) : (
            <>
              <Plus size={18} />
              كود خصم جديد
            </>
          )}
        </motion.button>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-bold"
          >
            <AlertCircle size={20} />
            {error}
            <button onClick={() => setError(null)} className="mr-auto p-1 hover:bg-red-500/20 rounded-lg transition">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleCreate}
              className="bg-[#1e293b] rounded-[2rem] p-8 border border-white/5 shadow-2xl space-y-6"
            >
              <h2 className="text-xl font-black flex items-center gap-2">
                <Sparkles className="text-secondary" size={22} />
                إنشاء كود خصم جديد
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                    <Hash size={14} />
                    كود الخصم
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          code: e.target.value.toUpperCase(),
                        }))
                      }
                      placeholder="مثال: SATR20"
                      required
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all font-mono tracking-widest text-lg"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-4 py-3 bg-secondary/20 text-secondary rounded-xl hover:bg-secondary/30 transition-colors font-bold text-sm whitespace-nowrap"
                    >
                      <Sparkles size={16} />
                    </button>
                  </div>
                </div>

                {/* Discount Percent */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                    <Percent size={14} />
                    نسبة الخصم (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={formData.discountPercent}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          discountPercent: parseInt(e.target.value) || 0,
                        }))
                      }
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all text-lg font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                      <div className="flex flex-col">
                        <button 
                          type="button" 
                          onClick={() => setFormData((prev) => ({ ...prev, discountPercent: Math.min(100, prev.discountPercent + 1) }))} 
                          className="text-white/30 hover:text-secondary p-0.5 transition-colors"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setFormData((prev) => ({ ...prev, discountPercent: Math.max(1, prev.discountPercent - 1) }))} 
                          className="text-white/30 hover:text-secondary p-0.5 transition-colors"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                      <span className="text-white/30 font-bold border-r border-white/10 pr-3">%</span>
                    </div>
                  </div>
                  {/* Quick select buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {[5, 10, 15, 20, 25, 30, 50].map((v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, discountPercent: v }))}
                        className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                          formData.discountPercent === v
                            ? "bg-secondary text-primary"
                            : "bg-white/5 text-white/40 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Uses */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-white/60 flex items-center gap-2">
                    <Hash size={14} />
                    الحد الأقصى للاستخدام
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          maxUses: parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col">
                      <button 
                        type="button" 
                        onClick={() => setFormData((prev) => ({ ...prev, maxUses: prev.maxUses + 1 }))} 
                        className="text-white/30 hover:text-secondary p-0.5 transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setFormData((prev) => ({ ...prev, maxUses: Math.max(0, prev.maxUses - 1) }))} 
                        className="text-white/30 hover:text-secondary p-0.5 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/30 font-bold">0 = غير محدود</p>
                </div>

                {/* Expiration Date - Custom Calendar */}
                <DatePickerField
                  value={formData.expiresAt}
                  onChange={(val) =>
                    setFormData((prev) => ({ ...prev, expiresAt: val }))
                  }
                />
              </div>

              {/* Preview */}
              {formData.code && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gradient-to-l from-secondary/20 via-secondary/5 to-transparent border border-secondary/20 rounded-2xl p-6 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/20 rounded-2xl flex items-center justify-center">
                      <Ticket className="text-secondary" size={24} />
                    </div>
                    <div>
                      <p className="font-mono font-black text-xl text-secondary tracking-widest">{formData.code}</p>
                      <p className="text-white/50 text-sm font-bold">
                        خصم {formData.discountPercent}%
                        {formData.maxUses > 0 && ` • ${formData.maxUses} استخدام`}
                        {formData.expiresAt && ` • حتى ${formData.expiresAt}`}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full bg-secondary text-primary py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg shadow-secondary/20 hover:brightness-110 transition-all disabled:opacity-50"
              >
                {creating ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    جاري الإنشاء...
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    إنشاء الكود
                  </>
                )}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons List */}
      {coupons.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#1e293b] rounded-[2.5rem] p-16 text-center border border-white/5"
        >
          <Ticket size={64} className="mx-auto text-white/10 mb-6" />
          <p className="text-white/40 font-bold text-lg mb-2">لا توجد أكواد خصم بعد</p>
          <p className="text-white/20 text-sm">أنشئ كود خصم جديد لتقديم عروض لعملائك</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {coupons.map((coupon, idx) => {
            const expired = isExpired(coupon.expiresAt);
            const usedUp = coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses;
            const isInactive = !coupon.isActive || expired || usedUp;

            return (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`relative bg-[#1e293b] rounded-[2rem] p-6 border shadow-xl transition-all group overflow-hidden ${
                  isInactive
                    ? "border-white/5 opacity-60"
                    : "border-secondary/20 hover:border-secondary/40"
                }`}
              >
                {/* Active gradient strip */}
                {!isInactive && (
                  <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-l from-secondary via-secondary/80 to-secondary/40" />
                )}

                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {expired ? (
                      <span className="text-[10px] px-2 py-1 rounded-full font-black bg-red-500/20 text-red-400">
                        منتهي
                      </span>
                    ) : usedUp ? (
                      <span className="text-[10px] px-2 py-1 rounded-full font-black bg-amber-500/20 text-amber-400">
                        مُستنفد
                      </span>
                    ) : coupon.isActive ? (
                      <span className="text-[10px] px-2 py-1 rounded-full font-black bg-emerald-500/20 text-emerald-400">
                        نشط
                      </span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 rounded-full font-black bg-white/10 text-white/40">
                        معطّل
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Copy */}
                    <button
                      onClick={() => handleCopy(coupon.code, coupon.id)}
                      className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/30 hover:text-white"
                      title="نسخ الكود"
                    >
                      {copiedId === coupon.id ? (
                        <Check size={16} className="text-emerald-400" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>

                    {/* Toggle */}
                    <button
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                      className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                      title={coupon.isActive ? "تعطيل" : "تفعيل"}
                    >
                      {coupon.isActive ? (
                        <ToggleRight size={20} className="text-emerald-400" />
                      ) : (
                        <ToggleLeft size={20} className="text-white/30" />
                      )}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => setCouponToDelete(coupon.id)}
                      disabled={deletingId === coupon.id}
                      className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-white/30 hover:text-red-400"
                      title="حذف"
                    >
                      {deletingId === coupon.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Code Display */}
                <div className="bg-white/5 rounded-2xl p-4 mb-5 text-center border border-white/5">
                  <p className="font-mono font-black text-2xl text-secondary tracking-[0.2em]">
                    {coupon.code}
                  </p>
                </div>

                {/* Discount */}
                <div className="flex items-center justify-center mb-5">
                  <div className="bg-secondary/10 text-secondary px-5 py-2 rounded-full font-black text-lg">
                    خصم {coupon.discountPercent}%
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-white/30 font-bold mb-1">الاستخدامات</p>
                    <p className="font-black text-white">
                      {coupon.usedCount}
                      <span className="text-white/30 text-sm font-bold">
                        {coupon.maxUses > 0 ? ` / ${coupon.maxUses}` : " / ∞"}
                      </span>
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-[10px] text-white/30 font-bold mb-1">الانتهاء</p>
                    <p className={`font-black text-sm ${expired ? "text-red-400" : "text-white"}`}>
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : "بلا حد"}
                    </p>
                  </div>
                </div>

                {/* Created date */}
                <p className="text-[10px] text-white/20 font-bold mt-4 text-center">
                  أُنشئ في {formatDate(coupon.createdAt)}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        isOpen={couponToDelete !== null}
        title="حذف كود الخصم"
        message="هل أنت متأكد من حذف كود الخصم بشكل نهائي؟"
        onConfirm={() => {
          if (couponToDelete) executeDelete(couponToDelete);
        }}
        onCancel={() => setCouponToDelete(null)}
      />
    </div>
  );
}
