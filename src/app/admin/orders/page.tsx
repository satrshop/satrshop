"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Clock,
  ChevronDown,
  MapPin,
  Truck,
  MessageCircle,
  FileSpreadsheet
} from "lucide-react";
import Link from "next/link";
import { exportToCSV } from "@/lib/exportUtils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (activeUpdateId) {
        setActiveUpdateId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeUpdateId]);

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

  const handleExport = () => {
    const headers = [
      { key: "id", label: "رقم الطلب" },
      { key: "customer.name", label: "اسم العميل" },
      { key: "customer.phone", label: "رقم الهاتف" },
      { key: "customer.city", label: "المدينة" },
      { key: "customer.address", label: "العنوان" },
      { key: "total", label: "المجموع" },
      { key: "shippingFee", label: "رسوم التوصيل" },
      { key: "status", label: "الحالة" },
      { key: "customer.gender", label: "الجنس" }
    ];
    exportToCSV(filteredOrders, "orders", headers);
  };

  const getWhatsAppLink = (phone: string) => {
    // Remove any non-numeric characters
    let cleanPhone = phone.replace(/\D/g, '');
    // If it starts with 07..., change to 9627...
    if (cleanPhone.startsWith('07') && cleanPhone.length === 10) {
      cleanPhone = '962' + cleanPhone.substring(1);
    }
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black mb-2">إدارة الطلبات</h1>
        <p className="text-white/60 font-bold text-lg">متابعة طلبات الزبائن وتحديث حالات الشحن والتحصيل.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <Search className="text-white/20 mr-2" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث برقم الطلب، اسم العميل، أو رقم الهاتف..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-white/20 font-bold"
          />
        </div>
        <div className="md:w-48 relative" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4 transition-all hover:border-secondary/20"
          >
            <Filter className={statusFilter !== 'all' ? "text-secondary" : "text-white/20"} size={20} />
            <span className="flex-1 text-right font-black text-white">
              {statusFilter === 'all' ? "كل الحالات" : 
               statusFilter === 'pending' ? "قيد الانتظار" :
               statusFilter === 'shipping' ? "جاري الشحن" : "مكتمل"}
            </span>
            <ChevronDown size={16} className={`text-white/20 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 left-0 mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
              >
                {[
                  { id: 'all', label: 'كل الحالات', icon: Filter, color: 'text-white' },
                  { id: 'pending', label: 'قيد الانتظار', icon: Clock, color: 'text-amber-500' },
                  { id: 'shipping', label: 'جاري الشحن', icon: Truck, color: 'text-blue-500' },
                  { id: 'completed', label: 'مكتمل', icon: CheckCircle2, color: 'text-emerald-500' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setStatusFilter(opt.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-right transition-colors hover:bg-white/5 ${
                      statusFilter === opt.id ? "bg-white/10" : ""
                    }`}
                  >
                    <opt.icon size={18} className={opt.color} />
                    <span className={`font-black text-sm ${statusFilter === opt.id ? 'text-secondary' : 'text-white/60'}`}>{opt.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button 
          onClick={handleExport}
          className="bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary transition-all p-4 rounded-2xl border border-secondary/20 font-black flex items-center justify-center gap-2 group"
        >
          <FileSpreadsheet size={20} className="group-hover:scale-110 transition-transform" />
          <span>تصدير لإكسل</span>
        </button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-white/60 font-bold text-lg">جاري تحميل الطلبات...</p>
        </div>
      ) : (
        <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="overflow-x-auto relative z-10">
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
                  {filteredOrders.map((order, index) => (
                    <React.Fragment key={order.id}>
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        exit={{ opacity: 0, scale: 0.95 }}
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
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-lg text-white group-hover:text-secondary transition-colors">{order.customer.name}</span>
                              {order.customer.isZaytoonah && (
                                <span className="bg-secondary/20 text-secondary text-[10px] font-black px-2 py-1 rounded-md border border-secondary/20 flex items-center gap-1">
                                  <MapPin size={10} />
                                  جامعة الزيتونة
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-sm text-white/60 font-black tracking-wider">{order.customer.phone}</span>
                              <a 
                                href={getWhatsAppLink(order.customer.phone)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 px-2 bg-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all rounded-md flex items-center gap-1 text-[10px] font-black text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                              >
                                <MessageCircle size={10} />
                                واتساب
                              </a>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-black text-xl text-secondary">{order.total.toFixed(2)} د.ا</td>
                        <td className="px-8 py-6 text-white/60 font-bold text-sm">
                          {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "---"}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                             <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm ${
                               order.status === "pending" ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                               order.status === "shipping" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                               "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                             }`}>
                               {order.status === "pending" && <Clock size={14} className="animate-pulse" />}
                               {order.status === "shipping" && <Truck size={14} className="animate-bounce" style={{ animationDuration: '3s' }} />}
                               {order.status === "completed" && <CheckCircle2 size={14} />}
                               <span className="text-[10px] font-black uppercase tracking-widest">
                                 {order.status === "pending" ? "قيد الانتظار" :
                                  order.status === "shipping" ? "جاري الشحن" : "مكتمل"}
                               </span>
                             </div>
                          </div>
                        </td>
                        <td className="px-8 py-6" onClick={(e) => e.stopPropagation()}>
                          <div className="relative">
                            <button
                              onClick={() => setActiveUpdateId(activeUpdateId === order.id ? null : order.id)}
                              className="bg-[#1e293b] border border-white/10 text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-3 hover:border-secondary transition-all text-white group"
                            >
                              <span>تحديث</span>
                              <ChevronDown size={14} className={`text-white/20 transition-transform ${activeUpdateId === order.id ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                              {activeUpdateId === order.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.9, x: 10 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  exit={{ opacity: 0, scale: 0.9, x: 10 }}
                                  className="absolute left-full top-0 mr-2 min-w-[140px] bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-[110] overflow-hidden backdrop-blur-2xl"
                                >
                                  {[
                                    { id: 'pending', label: 'معلق', icon: Clock, color: 'text-amber-500' },
                                    { id: 'shipping', label: 'شحن', icon: Truck, color: 'text-blue-500' },
                                    { id: 'completed', label: 'مكتمل', icon: CheckCircle2, color: 'text-emerald-500' },
                                  ].map((opt) => (
                                    <button
                                      key={opt.id}
                                      onClick={() => {
                                        handleStatusUpdate(order.id, opt.id as any);
                                        setActiveUpdateId(null);
                                      }}
                                      className={`w-full flex items-center gap-3 px-4 py-3 text-right hover:bg-white/5 transition-colors ${
                                        order.status === opt.id ? "bg-white/10" : ""
                                      }`}
                                    >
                                      <opt.icon size={14} className={opt.color} />
                                      <span className="font-black text-[10px] text-white/80">{opt.label}</span>
                                    </button>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
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
                            <td colSpan={6} className="px-8 py-8 bg-black/40 backdrop-blur-xl border-t border-white/5">
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
                                      {order.customer.gender && (
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-white/40 font-bold uppercase">الجنس</span>
                                          <span className="font-bold text-white">{order.customer.gender}</span>
                                        </div>
                                      )}
                                      <div className="pt-4 border-t border-white/5 space-y-3">
                                        {order.customer.isZaytoonah && (
                                          <div className="flex items-center justify-between bg-secondary/10 p-3 rounded-xl border border-secondary/20 mb-2">
                                            <span className="text-secondary font-bold text-xs">نوع التوصيل</span>
                                            <span className="font-black text-secondary text-sm">داخل جامعة الزيتونة</span>
                                          </div>
                                        )}
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
