"use client";

import { useState, useEffect } from "react";
import { getProducts } from "@/lib/db/products";
import { getOrders } from "@/lib/db/orders";
import { getMessages } from "@/lib/db/messages";
import { Product } from "@/types/models/product";
import { Order } from "@/types/models/order";
import { ContactMessage } from "@/types/models/message";
import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  Package, 
  TrendingUp, 
  Clock, 
  Loader2,
  Mail,
  ChevronLeft
} from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [prodData, orderData, msgData] = await Promise.all([
          getProducts(),
          getOrders(),
          getMessages()
        ]);
        setProducts(prodData);
        setOrders(orderData);
        setMessages(msgData);
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
  const unreadMessages = messages.filter(m => !m.isRead).length;

  const stats = [
    { name: "إجمالي المبيعات", value: `${totalSales.toFixed(2)} د.ا`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "عدد الطلبات", value: orders.length, icon: ShoppingBag, color: "text-blue-400", bg: "bg-blue-500/10" },
    { name: "الرسائل الواردة", value: messages.length, icon: Mail, color: "text-rose-400", bg: "bg-rose-500/10", unread: unreadMessages },
    { name: "طلبات معلقة", value: pendingOrders, icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
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
              {stat.unread !== undefined && stat.unread > 0 && (
                <span className="bg-rose-500 text-white text-[10px] px-2 py-1 rounded-full font-black animate-pulse">
                  {stat.unread} جديد
                </span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                        "bg-emerald-500/20 text-emerald-500"
                      }`}>
                        {order.status === "pending" ? "معلق" : "نشط"}
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

        {/* Recent Messages Section */}
        <div className="bg-[#1e293b] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="p-8 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-3">
              <Mail className="text-rose-400" />
              أحدث الرسائل
            </h2>
            <Link href="/admin/messages" className="text-rose-400 font-bold hover:underline py-2">
              عرض الكل
            </Link>
          </div>

          <div className="divide-y divide-white/5">
            {messages.slice(0, 5).map((msg) => (
              <div key={msg.id} className="p-6 hover:bg-white/5 transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white group-hover:text-rose-400 transition-colors">{msg.name}</h3>
                  <span className="text-[10px] text-white/20 font-bold">
                    {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "---"}
                  </span>
                </div>
                <p className="text-sm text-white/40 line-clamp-1 font-medium">{msg.content}</p>
                {!msg.isRead && (
                  <div className="mt-2 flex">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                  </div>
                )}
              </div>
            ))}
            {messages.length === 0 && (
              <div className="py-20 text-center text-white/40 font-bold">لا توجد رسائل جديدة</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

