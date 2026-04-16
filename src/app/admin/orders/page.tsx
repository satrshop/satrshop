"use client";

import React, { useState, useEffect } from "react";
import { getOrders, updateOrderStatus } from "@/lib/db/orders";
import { Order } from "@/types/models/order";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  ExternalLink,
  Loader2,
  CheckCircle2,
  Truck,
  Clock,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleStatusUpdate = async (id: string, newStatus: Order["status"]) => {
    const success = await updateOrderStatus(id, newStatus);
    if (success) {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } else {
      alert("فشل تحديث حالة الطلب.");
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customer.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black mb-2">إدارة الطلبات</h1>
        <p className="text-white/60 font-bold text-lg">متابعة طلبات الزبائن وتحديث حالات الشحن والتحصيل.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <Search className="text-white/20 mr-2" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-white/20"
          />
        </div>
        <div className="md:col-span-4 bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4 relative">
          <Filter className="text-white/20 mr-2" size={20} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex-1 bg-[#1e293b] border-none text-white focus:outline-none cursor-pointer font-bold appearance-none relative z-10"
          >
            <option value="all" className="bg-[#1e293b] text-white">كل الحالات</option>
            <option value="pending" className="bg-[#1e293b] text-white">قيد الانتظار</option>
            <option value="shipping" className="bg-[#1e293b] text-white">جاري الشحن</option>
            <option value="completed" className="bg-[#1e293b] text-white">مكتمل</option>
          </select>
          <ChevronDown size={16} className="text-white/20 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-white/60 font-bold text-lg">جاري تحميل الطلبات...</p>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-white/5 text-white/40 text-sm font-bold uppercase tracking-widest">
                  <th className="px-8 py-6">رقم الطلب</th>
                  <th className="px-8 py-6">العميل</th>
                  <th className="px-8 py-6">المجموع</th>
                  <th className="px-8 py-6">التاريخ</th>
                  <th className="px-8 py-6">الحالة</th>
                  <th className="px-8 py-6">تحديث الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <motion.tr 
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => toggleExpand(order.id)}
                        className={`hover:bg-white/5 transition-colors group cursor-pointer ${
                          expandedId === order.id ? "bg-white/5" : ""
                        }`}
                      >
                        <td className="px-8 py-6 font-mono text-xs text-white/40">
                          <div className="flex items-center gap-3">
                            <ChevronDown size={16} className={`transition-transform ${expandedId === order.id ? "" : "-rotate-90 text-white/20"}`} />
                            #{order.id.slice(0, 8)}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-white group-hover:text-secondary transition-colors">{order.customer.name}</span>
                            <span className="text-xs text-white/40 font-bold">{order.customer.phone}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-black text-xl text-secondary">{order.total.toFixed(2)} د.ا</td>
                        <td className="px-8 py-6 text-white/60 font-bold text-sm">
                          {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "---"}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                             {order.status === "pending" && <Clock size={16} className="text-amber-500" />}
                             {order.status === "shipping" && <Truck size={16} className="text-blue-500" />}
                             {order.status === "completed" && <CheckCircle2 size={16} className="text-emerald-500" />}
                             <span className={`text-xs font-black uppercase tracking-widest ${
                               order.status === "pending" ? "text-amber-500" :
                               order.status === "shipping" ? "text-blue-500" :
                               "text-emerald-500"
                             }`}>
                               {order.status === "pending" ? "قيد الانتظار" :
                                order.status === "shipping" ? "جاري الشحن" : "مكتمل"}
                             </span>
                          </div>
                        </td>
                        <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center gap-2 relative">
                            <select 
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value as any)}
                              className="bg-[#1e293b] border border-white/10 text-xs font-black px-4 py-2 rounded-lg focus:outline-none focus:border-secondary transition-all appearance-none text-white cursor-pointer relative z-10"
                            >
                              <option value="pending" className="bg-[#1e293b] text-white">معلق</option>
                              <option value="shipping" className="bg-[#1e293b] text-white">شحن</option>
                              <option value="completed" className="bg-[#1e293b] text-white">مكتمل</option>
                            </select>
                            <ChevronDown size={14} className="text-white/20 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                          </div>
                        </td>
                      </motion.tr>

                      {/* Expandable Content */}
                      <AnimatePresence>
                        {expandedId === order.id && (
                          <motion.tr
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                          >
                            <td colSpan={6} className="px-8 py-8 bg-black/20">
                              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                {/* Order Items */}
                                <div className="lg:col-span-8 space-y-4">
                                  <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-4">المنتجات المطلوبة</h3>
                                  <div className="space-y-3">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
                                        <div className="flex items-center gap-4">
                                          <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white/5">
                                            <img src={item.image} alt={item.name} className="object-cover w-full h-full" />
                                          </div>
                                          <div>
                                            <p className="font-bold text-white">{item.name}</p>
                                            <p className="text-xs text-white/40 font-bold">الكمية: {item.quantity}</p>
                                          </div>
                                        </div>
                                        <div className="text-left">
                                          <p className="font-black text-secondary">{item.price.toFixed(2)} د.ا</p>
                                          <p className="text-[10px] text-white/20 font-bold">للقطعة الواحدة</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Customer Details */}
                                <div className="lg:col-span-4 space-y-6">
                                  <div>
                                    <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-4">تفاصيل التوصيل</h3>
                                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5 space-y-4">
                                      <div className="flex flex-col">
                                        <span className="text-[10px] text-white/40 font-bold uppercase">المدينة</span>
                                        <span className="font-bold text-lg text-white">{order.customer.city}</span>
                                      </div>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] text-white/40 font-bold uppercase">العنوان التفصيلي</span>
                                        <span className="font-bold leading-relaxed text-white">{order.customer.address}</span>
                                      </div>
                                      <div className="pt-4 border-t border-white/5">
                                        <div className="flex items-center justify-between bg-primary/20 p-3 rounded-xl">
                                          <span className="text-white/60 font-bold text-sm">رسوم التوصيل</span>
                                          <span className="font-black text-amber-400">{order.shippingFee.toFixed(2)} د.ا</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  ))}
                </AnimatePresence>
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center text-white/20 font-black text-xl">لا توجد طلبات تطابق هذا البحث</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
