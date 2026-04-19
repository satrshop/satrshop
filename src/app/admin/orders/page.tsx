"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { getOrders, updateOrderStatus } from "@/lib/db/orders";
import { Order } from "@/types/models/order";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Loader2,
  CheckCircle2,
  Clock,
  ChevronDown,
  MapPin,
  Truck,
  MessageCircle,
  FileSpreadsheet,
  XCircle,
  ThumbsUp,
  Printer,
  Calendar
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { exportToCSV } from "@/lib/exportUtils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
  const [isExportingSheets, setIsExportingSheets] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeUpdateId, setActiveUpdateId] = useState<string | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const monthPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
      if (monthPickerRef.current && !monthPickerRef.current.contains(event.target as Node)) {
        setIsMonthPickerOpen(false);
      }
      if (activeUpdateId) {
        setActiveUpdateId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeUpdateId]);

  async function loadOrders() {
    setLoading(true);
    const data = await getOrders();
    setOrders(data);
    setLoading(false);
  }

  useEffect(() => {
     
    loadOrders();
  }, []);

  const statusCounts = useMemo(() => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      acc['all'] = (acc['all'] || 0) + 1;
      return acc;
    }, { all: 0, pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 } as Record<string, number>);
  }, [orders]);

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

  const filteredOrders = orders
    .filter(o => {
      const matchesSearch = 
        o.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customer.phone.includes(searchQuery);
      
      const matchesStatus = statusFilter === "all" || o.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // 1. Grouping: completed/cancelled at the bottom
      const isAFinished = a.status === 'completed' || a.status === 'cancelled';
      const isBFinished = b.status === 'completed' || b.status === 'cancelled';

      if (isAFinished && !isBFinished) return 1;
      if (!isAFinished && isBFinished) return -1;

      // 2. Chronological within groups (newest first)
      const dateA = a.createdAt?.toMillis?.() || 0;
      const dateB = b.createdAt?.toMillis?.() || 0;
      return dateB - dateA;
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

  const handleMonthlyExport = () => {
    if (!selectedMonth) {
      alert("الرجاء اختيار الشهر أولاً");
      return;
    }
    
    const [year, month] = selectedMonth.split("-").map(Number);
    
    const monthlyOrders = orders.filter(o => {
      if (!o.createdAt) return false;
      const orderDate = new Date(o.createdAt.seconds * 1000);
      return orderDate.getFullYear() === year && (orderDate.getMonth() + 1) === month;
    });

    if (monthlyOrders.length === 0) {
      alert("لا توجد طلبات في هذا الشهر.");
      return;
    }

    const exportData = monthlyOrders.map(order => ({
      id: order.id,
      total: order.total,
      date: order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "---"
    }));

    const headers = [
      { key: "id", label: "رقم الطلب" },
      { key: "total", label: "قيمة الطلب" },
      { key: "date", label: "تاريخ الطلب" }
    ];

    exportToCSV(exportData, `تقرير_طلبات_${selectedMonth}`, headers);
  };

  const handleGoogleSheetsExport = async () => {
    if (!selectedMonth) {
      alert("الرجاء اختيار الشهر أولاً");
      return;
    }
    
    setIsExportingSheets(true);

    try {
      const [year, month] = selectedMonth.split("-").map(Number);
      
      const monthlyOrders = orders.filter(o => {
        if (!o.createdAt) return false;
        const orderDate = new Date(o.createdAt.seconds * 1000);
        return orderDate.getFullYear() === year && (orderDate.getMonth() + 1) === month;
      });

      if (monthlyOrders.length === 0) {
        alert("لا توجد طلبات في هذا الشهر.");
        setIsExportingSheets(false);
        return;
      }

      const exportData = monthlyOrders.map(order => ({
        id: order.id,
        total: order.total,
        date: order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "---"
      }));

      const headers = [
        { key: "id", label: "رقم الطلب" },
        { key: "total", label: "قيمة الطلب" },
        { key: "date", label: "تاريخ الطلب" }
      ];

      const response = await fetch("/api/export/sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          title: `تقرير طلبات - ${selectedMonth}`,
          headers,
          data: exportData
        })
      });

      const resData = await response.json();

      if (response.ok && resData.url) {
        window.open(resData.url, "_blank");
      } else {
        alert("فشل في إنشاء الجداول: " + (resData.error || "مجهول"));
      }
    } catch (error) {
      console.error(error);
      alert("حدث خطأ في النظام أثناء التصدير.");
    } finally {
      setIsExportingSheets(false);
    }
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

      {/* Status Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { id: 'all', label: 'إجمالي الطلبات', icon: ShoppingBag, color: 'text-white', bgColor: 'bg-white/5', count: statusCounts.all },
          { id: 'pending', label: 'قيد الانتظار', icon: Clock, color: 'text-amber-500', bgColor: 'bg-amber-500/10', count: statusCounts.pending },
          { id: 'confirmed', label: 'تم التأكيد', icon: ThumbsUp, color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', count: statusCounts.confirmed },
          { id: 'shipping', label: 'جاري الشحن', icon: Truck, color: 'text-blue-500', bgColor: 'bg-blue-500/10', count: statusCounts.shipping },
          { id: 'completed', label: 'تم التوصيل', icon: CheckCircle2, color: 'text-emerald-500', bgColor: 'bg-emerald-500/10', count: statusCounts.completed },
          { id: 'cancelled', label: 'ملغي', icon: XCircle, color: 'text-red-500', bgColor: 'bg-red-500/10', count: statusCounts.cancelled },
        ].map((stat) => (
          <motion.button
            key={stat.id}
            whileHover={{ y: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStatusFilter(stat.id)}
            className={`p-5 rounded-3xl border transition-all text-right relative overflow-hidden group ${
              statusFilter === stat.id 
                ? 'bg-secondary/20 border-secondary shadow-lg shadow-secondary/10' 
                : `${stat.bgColor} border-white/5 hover:border-white/20`
            }`}
          >
            <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity ${stat.color}`}>
              <stat.icon size={80} />
            </div>
            <div className="relative z-10 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <stat.icon size={16} className={stat.color} />
                <span className="text-[10px] font-black uppercase tracking-widest text-white/40 group-hover:text-white/60 transition-colors">
                  {stat.label}
                </span>
              </div>
              <span className={`text-3xl font-black ${statusFilter === stat.id ? 'text-secondary' : 'text-white'}`}>
                {stat.count}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Search & Status */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="md:w-80 bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4 focus-within:border-secondary/50 transition-all shadow-sm">
            <Search className="text-white/20 mr-2" size={20} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="البحث برقم الطلب، العميل، الهاتف..."
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
               statusFilter === 'confirmed' ? "تم التأكيد" :
               statusFilter === 'shipping' ? "جاري الشحن" :
               statusFilter === 'completed' ? "مكتمل" : "ملغي"}
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
                  { id: 'confirmed', label: 'تم التأكيد', icon: ThumbsUp, color: 'text-indigo-400' },
                  { id: 'shipping', label: 'جاري الشحن', icon: Truck, color: 'text-blue-500' },
                  { id: 'completed', label: 'مكتمل', icon: CheckCircle2, color: 'text-emerald-500' },
                  { id: 'cancelled', label: 'ملغي', icon: XCircle, color: 'text-red-500' },
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
        </div>
        
        {/* Exports */}
        <div className="flex flex-col xl:flex-row items-center gap-4 border-t xl:border-t-0 border-white/5 pt-4 xl:pt-0 mt-2 xl:mt-0 w-full xl:w-auto">
          {/* Monthly Export Container */}
          <div className="flex flex-col sm:flex-row items-center bg-[#1e293b] p-1.5 rounded-2xl border border-white/10 hover:border-secondary/40 transition-all shadow-lg shadow-black/20 w-full xl:w-auto relative" ref={monthPickerRef}>
            <div 
              onClick={() => setIsMonthPickerOpen(!isMonthPickerOpen)}
              className="relative flex items-center justify-between gap-3 px-4 w-full sm:w-44 sm:border-l border-white/10 group cursor-pointer h-11 mb-2 sm:mb-0"
            >
              <Calendar size={18} className={`transition-transform group-hover:scale-110 ${isMonthPickerOpen || selectedMonth ? 'text-secondary' : 'text-white/40'}`} />
              <div className="flex-1 text-center mr-2">
                <span className={`font-black text-sm uppercase tracking-wider ${selectedMonth ? 'text-white' : 'text-white/40'}`}>
                  {selectedMonth 
                    ? new Date(selectedMonth + "-01").toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })
                    : 'اختر الشهر'}
                </span>
              </div>
            </div>
            
            <AnimatePresence>
              {isMonthPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full mt-3 right-0 w-72 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl p-4"
                >
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <button 
                      onClick={() => setPickerYear(prev => prev - 1)}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
                    >
                      <ChevronDown size={18} className="transform rotate-90" />
                    </button>
                    <span className="font-black text-secondary text-lg">{pickerYear}</span>
                    <button 
                      onClick={() => setPickerYear(prev => prev + 1)}
                      className="p-2 hover:bg-white/5 rounded-lg text-white/60 hover:text-white transition-colors"
                      disabled={pickerYear >= new Date().getFullYear()}
                    >
                      <ChevronDown size={18} className={`transform -rotate-90 ${pickerYear >= new Date().getFullYear() ? 'opacity-30' : ''}`} />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => {
                      const monthStr = month.toString().padStart(2, '0');
                      const val = `${pickerYear}-${monthStr}`;
                      const isSelected = selectedMonth === val;
                      const monthName = new Date(`${val}-01`).toLocaleDateString('ar-EG', { month: 'short' });
                      
                      return (
                        <button
                          key={month}
                          onClick={() => {
                            setSelectedMonth(val);
                            setIsMonthPickerOpen(false);
                          }}
                          className={`py-3 rounded-xl font-black text-sm transition-all ${
                            isSelected 
                              ? 'bg-secondary text-primary shadow-lg shadow-secondary/20' 
                              : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {monthName}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button 
                onClick={handleMonthlyExport}
                disabled={!selectedMonth}
                title="تصدير الشهر بصيغة إكسل CSV"
                className="bg-secondary text-primary hover:bg-white transition-all px-4 h-11 w-full sm:w-auto rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-secondary disabled:cursor-not-allowed flex-1"
              >
                <FileSpreadsheet size={18} />
                <span className="whitespace-nowrap">إكسل</span>
              </button>
              <button 
                onClick={handleGoogleSheetsExport}
                disabled={!selectedMonth || isExportingSheets}
                title="تصدير الشهر إلى Google Sheets"
                className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all px-4 h-11 w-full sm:w-auto rounded-xl font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-emerald-500/10 disabled:hover:text-emerald-500 disabled:cursor-not-allowed border border-emerald-500/20 flex-1"
              >
                {isExportingSheets ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                <span className="whitespace-nowrap">جوجل شيت</span>
              </button>
            </div>
          </div>
          
          {/* Current Search Export */}
          <button 
            onClick={handleExport}
            className="bg-[#1e293b] hover:bg-white/10 text-white/70 hover:text-white transition-all px-5 h-14 rounded-2xl border border-white/10 hover:border-white/20 font-bold flex items-center justify-center gap-3 w-full xl:w-auto shadow-lg"
          >
            <FileSpreadsheet size={20} className="text-white/50" />
            <div className="flex flex-col items-start gap-0.5">
              <span className="text-sm">تصدير القائمة</span>
              <span className="text-[10px] text-white/40 font-normal">حسب الفلترة والبحث</span>
            </div>
          </button>
        </div>
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
                               order.status === "confirmed" ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" :
                               order.status === "shipping" ? "bg-blue-500/10 border-blue-500/20 text-blue-500" :
                               order.status === "completed" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                               "bg-red-500/10 border-red-500/20 text-red-500"
                             }`}>
                               {order.status === "pending" && <Clock size={14} className="animate-pulse" />}
                               {order.status === "confirmed" && <ThumbsUp size={14} />}
                               {order.status === "shipping" && <Truck size={14} className="animate-bounce" style={{ animationDuration: '3s' }} />}
                               {order.status === "completed" && <CheckCircle2 size={14} />}
                               {order.status === "cancelled" && <XCircle size={14} />}
                               <span className="text-[10px] font-black uppercase tracking-widest">
                                 {order.status === "pending" ? "قيد الانتظار" :
                                  order.status === "confirmed" ? "تم التأكيد" :
                                  order.status === "shipping" ? "جاري الشحن" :
                                  order.status === "completed" ? "مكتمل" : "ملغي"}
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
                                  {(
                                    [
                                      { id: 'pending', label: 'معلق', icon: Clock, color: 'text-amber-500' },
                                      { id: 'confirmed', label: 'تأكيد', icon: ThumbsUp, color: 'text-indigo-400' },
                                      { id: 'shipping', label: 'شحن', icon: Truck, color: 'text-blue-500' },
                                      { id: 'completed', label: 'مكتمل', icon: CheckCircle2, color: 'text-emerald-500' },
                                      { id: 'cancelled', label: 'ملغي', icon: XCircle, color: 'text-red-500' },
                                    ] as const
                                  ).map((opt) => (
                                    <button
                                      key={opt.id}
                                      onClick={() => {
                                        handleStatusUpdate(order.id, opt.id);
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
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
                            <td colSpan={6} className="p-0 border-none">
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                                className="overflow-hidden bg-black/40 backdrop-blur-xl border-t border-white/5"
                              >
                                <div className="px-8 py-10">
                                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                    {/* Order Items */}
                                    <div className="lg:col-span-8 space-y-4">
                                      <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-4 border-r-2 border-secondary pr-3">المنتجات المطلوبة</h3>
                                      <div className="space-y-3">
                                        {order.items.map((item, idx) => (
                                          <div key={idx} className="bg-white/5 p-4 rounded-3xl flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors">
                                            <div className="flex items-center gap-4">
                                              <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 ring-4 ring-black/20">
                                                <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />
                                              </div>
                                              <div>
                                                <p className="font-bold text-white text-lg">{item.name}</p>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                  {(item as { selectedColor?: { code: string, name: string } }).selectedColor && (
                                                    <div className="flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                                                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: (item as { selectedColor?: { code: string, name: string } }).selectedColor?.code }} />
                                                      <span className="text-[10px] text-white/60">{(item as { selectedColor?: { code: string, name: string } }).selectedColor?.name}</span>
                                                    </div>
                                                  )}
                                                  {(item as { selectedSize?: string }).selectedSize && (
                                                    <div className="flex items-center bg-white/10 px-2 py-0.5 rounded-md border border-white/10">
                                                      <span className="text-[10px] text-white/60">{(item as { selectedSize?: string }).selectedSize}</span>
                                                    </div>
                                                  )}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                  <span className="text-xs text-secondary font-black">الكمية: {item.quantity}</span>
                                                  <span className="w-1 h-1 rounded-full bg-white/10" />
                                                  <span className="text-xs text-white/40 font-bold">#{item.id.slice(0, 6)}</span>
                                                </div>
                                              </div>
                                            </div>
                                            <div className="text-left bg-black/20 px-4 py-2 rounded-2xl border border-white/5">
                                              <p className="font-black text-secondary text-lg">{item.price.toFixed(2)} د.ا</p>
                                              <p className="text-[10px] text-white/20 font-bold">للقطعة الواحدة</p>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Customer Details */}
                                    <div className="lg:col-span-4 space-y-6">
                                      <div>
                                        <h3 className="text-white/40 font-black text-xs uppercase tracking-widest mb-4 border-r-2 border-secondary pr-3">تفاصيل التوصيل</h3>
                                        <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/5 space-y-5 shadow-inner">
                                          <div className="flex flex-col">
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">المدينة</span>
                                            <span className="font-black text-xl text-white mt-1">{order.customer.city}</span>
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">العنوان التفصيلي</span>
                                            <span className="font-bold leading-relaxed text-white/90 mt-1">{order.customer.address}</span>
                                          </div>
                                          {order.customer.gender && (
                                            <div className="flex flex-col">
                                              <span className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">الجنس</span>
                                              <span className="font-black text-white mt-1">{order.customer.gender}</span>
                                            </div>
                                          )}
                                          <div className="pt-6 border-t border-white/5 space-y-3">
                                            <Link 
                                              href={`/admin/orders/${order.id}/invoice`}
                                              target="_blank"
                                              className="w-full flex items-center justify-center gap-2 bg-secondary text-primary py-4 rounded-2xl font-black hover:bg-white transition-all shadow-xl shadow-secondary/10 mb-2"
                                            >
                                              <Printer size={20} />
                                              طباعة الفاتورة
                                            </Link>
                                            
                                            {order.customer.isZaytoonah && (
                                              <div className="flex items-center justify-between bg-secondary/10 p-4 rounded-2xl border border-secondary/20 mb-2">
                                                <span className="text-secondary font-bold text-xs">نوع التوصيل</span>
                                                <span className="font-black text-secondary text-sm">داخل جامعة الزيتونة</span>
                                              </div>
                                            )}
                                            <div className="flex items-center justify-between bg-primary/40 p-4 rounded-2xl border border-white/5">
                                              <span className="text-white/60 font-bold text-sm">رسوم التوصيل</span>
                                              <span className="font-black text-amber-400 text-lg">{order.shippingFee.toFixed(2)} د.ا</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
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
