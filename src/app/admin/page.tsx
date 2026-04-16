"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/db/products";
import { getOrders } from "@/lib/db/orders"; // I'll need to add this
import { Product } from "@/types/models/product";
import { Order } from "@/types/models/order";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  ChevronLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, orderData] = await Promise.all([
          getProducts(),
          getOrders()
        ]);
        setProducts(prodData);
        setOrders(orderData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        <p className="text-white/60 font-bold">جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  const totalSales = orders
    .filter(o => o.status === "completed" || o.status === "shipping")
    .reduce((acc, current) => acc + current.total, 0);

  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const stats = [
    { name: "إجمالي المبيعات", value: `${totalSales.toFixed(2)} د.ا`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "عدد الطلبات", value: orders.length, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "المنتجات", value: products.length, icon: Package, color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "طلبات معلقة", value: pendingOrders, icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black mb-2">لوحة التحكم</h1>
        <p className="text-white/60 font-bold text-lg">أهلاً بك مجدداً. إليك نظرة على أداء المتجر اليوم.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={stat.name}
            className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-xl group hover:border-secondary/20 transition-all"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={28} />
            </div>
            <p className="text-white/40 font-bold mb-2">{stat.name}</p>
            <h2 className="text-3xl font-black">{stat.value}</h2>
          </motion.div>
        ))}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-[#1e293b] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-black flex items-center gap-3">
            <Clock className="text-secondary" />
            أحدث الطلبات
          </h2>
          <Link href="/admin/orders" className="text-secondary font-bold hover:underline py-2">
            عرض الكل
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-white/5 text-white/40 text-sm font-bold uppercase tracking-widest">
                <th className="px-8 py-5">رقم الطلب</th>
                <th className="px-8 py-5">العميل</th>
                <th className="px-8 py-5">المجموع</th>
                <th className="px-8 py-5">الحالة</th>
                <th className="px-8 py-5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-8 py-5 font-mono text-xs text-white/60">#{order.id.slice(0, 8)}</td>
                  <td className="px-8 py-5 font-bold">{order.customer.name}</td>
                  <td className="px-8 py-5 font-black text-secondary">{order.total.toFixed(2)} د.ا</td>
                  <td className="px-8 py-5">
                    <span className={`px-4 py-1.5 rounded-full text-xs font-black ${
                      order.status === "pending" ? "bg-amber-500/20 text-amber-500" :
                      order.status === "shipping" ? "bg-blue-500/20 text-blue-500" :
                      "bg-emerald-500/20 text-emerald-500"
                    }`}>
                      {order.status === "pending" ? "معلق" :
                       order.status === "shipping" ? "جاري الشحن" : "مكتمل"}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-center">
                    <Link href={`/admin/orders/${order.id}`}>
                      <button className="p-2 hover:bg-white/10 rounded-lg transition-all text-secondary">
                        <ChevronLeft size={20} className="rotate-180" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-white/40 font-bold"> لا توجد طلبات بعد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
