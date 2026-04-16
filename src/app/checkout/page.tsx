"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  ShoppingBag, 
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { createOrder } from "@/lib/db/orders";
import Header from "@/components/layout/Header";

const JORDAN_CITIES = [
  "عمان", "الزرقاء", "إربد", "العقبة", "السلط", "مادبا", 
  "المفرق", "جرش", "عجلون", "الكرك", "الطفيلة", "معان"
];

const SHIPPING_FEE = 2.00;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "عمان",
    address: ""
  });

  useEffect(() => {
    setMounted(true);
    // If cart is empty, redirect to shop
    if (mounted && items.length === 0) {
      router.push("/shop");
    }
  }, [mounted, items, router]);

  if (!mounted || items.length === 0) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + SHIPPING_FEE;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Basic Validation
    if (!formData.name || !formData.phone || !formData.address) {
      setError("يرجى ملء جميع الحقول المطلوبة");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderId = await createOrder({
        items: items.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity
        })),
        total: total,
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          city: formData.city,
          address: formData.address
        },
        paymentMethod: 'cod',
        shippingFee: SHIPPING_FEE
      });

      if (orderId) {
        router.push(`/checkout/success?id=${orderId}`);
      } else {
        throw new Error("Failed to create order");
      }
    } catch (err) {
      setError("حدث خطأ أثناء إتمام الطلب. يرجى المحاولة مرة أخرى.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF4E3] pb-20 selection:bg-secondary selection:text-white">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 sm:pt-36 lg:pt-44">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* Left Side: Form */}
          <div className="flex-1 space-y-8">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-primary rounded-3xl p-6 sm:p-10 shadow-xl border border-white/10 text-white"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-8 text-right flex items-center justify-end gap-3">
                معلومات التوصيل
                <MapPin className="text-secondary" size={28} />
              </h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-bold"
                  >
                    <AlertCircle size={20} />
                    {error}
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70 block text-right">الاسم الكامل *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-right text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="أدخل اسمك الكامل"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-white/70 block text-right">رقم الهاتف *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-right text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="07XXXXXXXX"
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-white/70 block text-right">البريد الإلكتروني (اختياري)</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-right text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="example@mail.com"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                    </div>
                  </div>

                  {/* City */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-white/70 block text-right">المدينة *</label>
                    <div className="relative z-20">
                      <button
                        type="button"
                        onClick={() => setIsCityOpen(!isCityOpen)}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-right text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all flex items-center justify-between"
                      >
                        <motion.div animate={{ rotate: isCityOpen ? 180 : 0 }}>
                          <ChevronDown size={18} />
                        </motion.div>
                        <span className="font-bold">{formData.city}</span>
                      </button>

                      <AnimatePresence>
                        {isCityOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full mt-2 w-full bg-[#1e4a5e] backdrop-blur-xl border border-white/10 rounded-xl p-2 shadow-2xl overflow-hidden z-30 max-h-[250px] overflow-y-auto custom-scrollbar"
                          >
                            {JORDAN_CITIES.map((city) => (
                              <button
                                key={city}
                                type="button"
                                onClick={() => {
                                  setFormData(prev => ({ ...prev, city }));
                                  setIsCityOpen(false);
                                }}
                                className={`w-full text-right px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                                  formData.city === city
                                    ? "bg-secondary text-white"
                                    : "text-white/80 hover:bg-white/10"
                                } mb-1 last:mb-0`}
                              >
                                {city}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-white/70 block text-right">العنوان بالتفصيل *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-right text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none"
                      placeholder="المنطقة، الشارع، رقم البناية..."
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full h-14 bg-secondary text-secondary-foreground rounded-2xl font-bold text-lg flex items-center justify-center gap-3 shadow-lg shadow-secondary/20 hover:bg-white hover:text-secondary hover:border-secondary transition-all relative overflow-hidden group border border-transparent ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        جاري إرسال الطلب...
                      </>
                    ) : (
                      <>
                        إتمام الطلب الآن
                        <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                      </>
                    )}
                  </button>
                  <p className="text-center text-xs text-white/60 mt-4 font-medium italic">
                    * الدفع نقداً عند الاستلام (Cash on Delivery)
                  </p>
                </div>
              </form>
            </motion.div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="w-full lg:w-[400px]">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-primary rounded-3xl p-6 sm:p-8 shadow-xl border border-white/10 text-white sticky top-32 lg:top-44"
            >
              <h2 className="text-xl font-bold text-white mb-6 text-right flex items-center justify-end gap-2">
                ملخص الطلب
                <ShoppingBag size={22} className="text-secondary" />
              </h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center border-b border-white/10 pb-4 last:border-0 last:pb-0">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                      <Image 
                        src={item.image} 
                        alt={item.name} 
                        fill 
                        sizes="64px"
                        className="object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <h4 className="font-bold text-sm text-white line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-white/60 mt-1">
                        الكمية: {item.quantity} × {item.price.toFixed(2)} د.ا
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-secondary font-bold">{subtotal.toFixed(2)} د.ا</span>
                  <span className="text-white/70">المجموع الفرعي</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-secondary font-bold">{SHIPPING_FEE.toFixed(2)} د.ا</span>
                  <span className="text-white/70">تكاليف التوصيل</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-dashed border-white/20 mb-2">
                  <span className="text-2xl font-black text-secondary">{total.toFixed(2)} د.ا</span>
                  <span className="text-lg font-extrabold text-white">الإجمالي</span>
                </div>
              </div>

              <Link href="/shop" className="flex items-center justify-center gap-2 mt-6 text-sm font-bold text-white/50 hover:text-secondary transition-colors">
                متابعة التسوق
                <ArrowLeft size={16} />
              </Link>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
