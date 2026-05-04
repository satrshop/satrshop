"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/models/product";
import { Order } from "@/types/models/order";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  TrendingUp, 
  Clock, 
  Loader2,
  AlertTriangle
} from "lucide-react";
import Link from "next/link";
import { adminFetch } from "@/lib/api/admin-client";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, orderRes] = await Promise.all([
          adminFetch<{ products: Product[] }>("/api/admin/products"),
          adminFetch<{ orders: Order[] }>("/api/admin/orders")
        ]);
        setProducts(prodRes.products);
        setOrders(orderRes.orders);
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

  const successfulOrders = orders.filter(
    (o) => o.status === "completed" || o.status === "shipping" || o.status === "confirmed"
  );

  const totalSales = successfulOrders.reduce((acc, current) => acc + current.total, 0);

  const totalProfit = successfulOrders.reduce((acc, order) => {
    const orderProfit = order.items.reduce((itemAcc, item) => {
      // If costPrice is missing for some reason, assume 0 for safety but ideally it should be there
      const itemProfit = (item.price - (item.costPrice ?? 0)) * item.quantity;
      return itemAcc + itemProfit;
    }, 0);
    return acc + orderProfit;
  }, 0);

  const pendingOrders = orders.filter(o => o.status === "pending").length;

  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;

  const stats = [
    { name: "إجمالي المبيعات", value: `${totalSales.toFixed(2)} د.ا`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "صافي الربح", value: `${totalProfit.toFixed(2)} د.ا`, icon: ShoppingBag, color: "text-amber-400", bg: "bg-amber-500/10" },
    { name: "طلبات معلقة", value: pendingOrders, icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
    { name: "تنبيهات المخزون", value: outOfStockCount + lowStockCount, icon: AlertTriangle, color: (outOfStockCount > 0 ? "text-red-400" : "text-amber-400"), bg: (outOfStockCount > 0 ? "bg-red-500/10" : "bg-amber-500/10"), detail: outOfStockCount > 0 ? `${outOfStockCount} نفذت` : `${lowStockCount} منخفضة` },
  ];

  return (
    <div className="space-y-10 text-right" dir="rtl">
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
            className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-xl group hover:border-secondary/20 transition-all relative overflow-hidden"
          >
            <div className={`w-14 h-14 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-6`}>
              <stat.icon size={28} />
            </div>
            <p className="text-white/40 font-bold mb-2">{stat.name}</p>
            <div className="flex items-end justify-between">
              <h2 className="text-3xl font-black">{stat.value}</h2>
              {stat.detail && (
                <span className={`text-[10px] px-2 py-1 rounded-full font-black ${stat.color} bg-white/5`}>
                  {stat.detail}
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Recent Orders Section */}
        <div className="bg-[#1e293b] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Clock className="text-secondary" />
              أحدث الطلبات
            </h2>
            <Link 
              href="/admin/orders" 
              className="group flex items-center gap-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary px-5 py-2 rounded-xl font-bold transition-all border border-secondary/20"
            >
              عرض الكل
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-white/5 text-white/40 text-sm font-bold uppercase tracking-widest">
                  <th className="px-6 py-5">العميل</th>
                  <th className="px-6 py-5">المجموع</th>
                  <th className="px-6 py-5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-5 font-bold text-white/90">{order.customer.name}</td>
                    <td className="px-6 py-5 font-black text-secondary">{order.total.toFixed(2)} د.ا</td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        order.status === "pending" ? "bg-amber-500/20 text-amber-500" :
                        order.status === "cancelled" ? "bg-red-500/20 text-red-500" :
                        "bg-emerald-500/20 text-emerald-500"
                      }`}>
                        {order.status === "pending" ? "معلق" : 
                         order.status === "cancelled" ? "ملغي" : "نشط"}
                      </span>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-8 py-20 text-center text-white/40 font-bold"> لا توجد طلبات بعد</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
