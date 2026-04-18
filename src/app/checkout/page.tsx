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
  const [isZaytoonah, setIsZaytoonah] = useState(false);
  const [gender, setGender] = useState<'ذكر' | 'أنثى' | null>(null);

  useEffect(() => {
    setMounted(true);
    // If cart is empty, redirect to shop
    if (mounted && items.length === 0) {
      router.push("/shop");
    }
  }, [mounted, items, router]);

  if (!mounted || items.length === 0) return null;

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const currentShippingFee = isZaytoonah ? 0 : SHIPPING_FEE;
  const total = subtotal + currentShippingFee;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleZaytoonahToggle = () => {
    setIsZaytoonah(!isZaytoonah);
    if (!isZaytoonah) {
      setFormData(prev => ({
        ...prev,
        city: "عمان",
        address: "جامعة الزيتونة الاردنية"
      }));
    }
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
          address: formData.address,
          isZaytoonah: isZaytoonah,
          gender: gender || undefined
        },
        paymentMethod: 'cod',
        shippingFee: currentShippingFee
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
              className="bg-primary rounded-3xl p-6 sm:p-10 shadow-xl border border-primary-foreground/10 text-primary-foreground"
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary-foreground mb-8 text-right flex items-center justify-end gap-3">
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
                    <label className="text-sm font-bold text-primary-foreground/70 block text-right">الاسم الكامل *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/10 border border-primary-foreground/20 rounded-xl px-4 py-3.5 text-right text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="أدخل اسمك الكامل"
                      />
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" size={18} />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-primary-foreground/70 block text-right">رقم الهاتف *</label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white/10 border border-primary-foreground/20 rounded-xl px-4 py-3.5 text-right text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="07XXXXXXXX"
                      />
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" size={18} />
                    </div>
                  </div>

                  {/* Gender Selection */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-primary-foreground/70 block text-right">الجنس *</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setGender('ذكر')}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${gender === 'ذكر' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-primary-foreground/10 text-primary-foreground/60 hover:bg-white/10'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'ذكر' ? 'border-secondary' : 'border-primary-foreground/30'}`}>
                          {gender === 'ذكر' && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                        </div>
                        <span className="font-bold">ذكر</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setGender('أنثى')}
                        className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${gender === 'أنثى' ? 'bg-secondary/20 border-secondary text-secondary' : 'bg-white/5 border-primary-foreground/10 text-primary-foreground/60 hover:bg-white/10'}`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${gender === 'أنثى' ? 'border-secondary' : 'border-primary-foreground/30'}`}>
                          {gender === 'أنثى' && <div className="w-2.5 h-2.5 rounded-full bg-secondary" />}
                        </div>
                        <span className="font-bold">أنثى</span>
                      </button>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-primary-foreground/70 block text-right">البريد الإلكتروني (اختياري)</label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-white/10 border border-primary-foreground/20 rounded-xl px-4 py-3.5 text-right text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all"
                        placeholder="example@mail.com"
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-primary-foreground/40" size={18} />
                    </div>
                  </div>

                  {/* Zaytoonah Checkbox */}
                  <div 
                    className={`md:col-span-2 rounded-2xl p-4 flex items-center justify-between group transition-all cursor-pointer border-2 shadow-lg ${isZaytoonah ? 'bg-secondary/20 border-secondary' : 'bg-white/5 border-primary-foreground/10 hover:bg-white/10'}`} 
                    onClick={handleZaytoonahToggle}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${isZaytoonah ? 'bg-secondary border-secondary' : 'border-primary-foreground/30'}`}>
                        {isZaytoonah && <CheckCircle2 size={16} className="text-secondary-foreground" />}
                      </div>
                      <span className={`font-bold transition-colors ${isZaytoonah ? 'text-secondary font-black' : 'text-primary-foreground/70'}`}>التوصيل داخل جامعة الزيتونة (مجاناً)</span>
                    </div>
                    <MapPin size={20} className={isZaytoonah ? 'text-secondary' : 'text-primary-foreground/30'} />
                  </div>

                  {/* City */}
                  <div className="space-y-2 relative">
                    <label className="text-sm font-bold text-primary-foreground/70 block text-right">المدينة *</label>
                    <div className="relative z-20">
                      <button
                        type="button"
                        onClick={() => !isZaytoonah && setIsCityOpen(!isCityOpen)}
                        disabled={isZaytoonah}
                        className={`w-full bg-white/10 border border-primary-foreground/20 rounded-xl px-4 py-3.5 text-right text-primary-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all flex items-center justify-between ${isZaytoonah ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                            className="absolute top-full mt-2 w-full bg-[#1e4a5e] backdrop-blur-xl border border-primary-foreground/10 rounded-xl p-2 shadow-2xl overflow-hidden z-30 max-h-[250px] overflow-y-auto custom-scrollbar"
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
                                    : "text-primary-foreground/80 hover:bg-white/10"
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
                    <label className="text-sm font-bold text-primary-foreground/70 block text-right">العنوان بالتفصيل *</label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      required
                      disabled={isZaytoonah}
                      rows={3}
                      className={`w-full bg-white/10 border border-primary-foreground/20 rounded-xl px-4 py-3.5 text-right text-primary-foreground placeholder:text-primary-foreground/30 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:border-secondary transition-all resize-none ${isZaytoonah ? 'opacity-50 cursor-not-allowed' : ''}`}
                      placeholder={isZaytoonah ? "جامعة الزيتونة الاردنية" : "المنطقة، الشارع، رقم البناية..."}
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
                  <p className="text-center text-xs text-primary-foreground/60 mt-4 font-medium italic">
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
              className="bg-primary rounded-3xl p-6 sm:p-8 shadow-xl border border-primary-foreground/10 text-primary-foreground sticky top-32 lg:top-44"
            >
              <h2 className="text-xl font-bold text-primary-foreground mb-6 text-right flex items-center justify-end gap-2">
                ملخص الطلب
                <ShoppingBag size={22} className="text-secondary" />
              </h2>

              <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-center border-b border-primary-foreground/10 pb-4 last:border-0 last:pb-0">
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
                      <h4 className="font-bold text-sm text-primary-foreground line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-primary-foreground/60 mt-1">
                        الكمية: {item.quantity} × {item.price.toFixed(2)} د.ا
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-100">
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className="text-secondary font-bold">{subtotal.toFixed(2)} د.ا</span>
                  <span className="text-primary-foreground/70">المجموع الفرعي</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium">
                  <span className={`${isZaytoonah ? 'text-emerald-400 font-black' : 'text-secondary font-bold'}`}>
                    {isZaytoonah ? 'مجاناً' : `${currentShippingFee.toFixed(2)} د.ا`}
                  </span>
                  <span className="text-primary-foreground/70">تكاليف التوصيل</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-3 border-t-2 border-dashed border-primary-foreground/20 mb-2">
                  <span className="text-2xl font-black text-secondary">{total.toFixed(2)} د.ا</span>
                  <span className="text-lg font-extrabold text-primary-foreground">الإجمالي</span>
                </div>
              </div>

              <Link href="/shop" className="flex items-center justify-center gap-2 mt-6 text-sm font-bold text-primary-foreground/50 hover:text-secondary transition-colors">
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
