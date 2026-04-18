"use client";

import React, { useState, useEffect, useRef } from "react";
import { getOrders } from "@/lib/db/orders";
import { Order } from "@/types/models/order";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, 
  Search, 
  Filter, 
  Loader2,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  User,
  Calendar,
  ShoppingBag,
  FileSpreadsheet
} from "lucide-react";
import { exportToCSV } from "@/lib/exportUtils";

interface Customer {
  id: string; // Using phone number as ID for uniqueness in this view
  name: string;
  phone: string;
  email?: string;
  gender?: 'ذكر' | 'أنثى';
  city: string;
  orderCount: number;
  totalSpent: number;
  lastOrderDate: any;
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    setLoading(true);
    const orders = await getOrders();
    
    // Group orders by phone number to extract unique customers
    const customerMap = new Map<string, Customer>();
    
    orders.forEach(order => {
      // Clean phone number for grouping
      const phone = (order.customer?.phone || '').replace(/\D/g, '');
      if (!phone) return; // Skip invalid entries
      
      const existing = customerMap.get(phone);
      
      if (existing) {
        existing.orderCount += 1;
        existing.totalSpent += order.total;
        // Keep the most recent data (Firestore Timestamp comparison)
        const orderSeconds = order.createdAt?.seconds || 0;
        const existingSeconds = existing.lastOrderDate?.seconds || 0;
        
        if (orderSeconds > existingSeconds) {
          existing.name = order.customer.name;
          if (order.customer.email) existing.email = order.customer.email;
          if (order.customer.gender) existing.gender = order.customer.gender;
          existing.city = order.customer.city;
          existing.lastOrderDate = order.createdAt;
        }
      } else {
        customerMap.set(phone, {
          id: phone,
          name: order.customer.name,
          phone: order.customer.phone,
          email: order.customer.email,
          gender: order.customer.gender,
          city: order.customer.city,
          orderCount: 1,
          totalSpent: order.total,
          lastOrderDate: order.createdAt
        });
      }
    });
    
    setCustomers(Array.from(customerMap.values()));
    setLoading(false);
  }

  const getWhatsAppLink = (phone: string) => {
    let cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.startsWith('07') && cleanPhone.length === 10) {
      cleanPhone = '962' + cleanPhone.substring(1);
    }
    return `https://wa.me/${cleanPhone}`;
  };

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery);
    
    const matchesGender = genderFilter === "all" || c.gender === genderFilter;
    
    return matchesSearch && matchesGender;
  });

  const handleExport = () => {
    const headers = [
      { key: "name", label: "الاسم" },
      { key: "phone", label: "الهاتف" },
      { key: "email", label: "البريد الإلكتروني" },
      { key: "gender", label: "الجنس" },
      { key: "city", label: "المدينة" },
      { key: "orderCount", label: "عدد الطلبات" },
      { key: "totalSpent", label: "إجمالي الإنفاق" }
    ];
    exportToCSV(filteredCustomers, "customers", headers);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-3">
          <Users className="text-secondary" size={32} />
          قاعدة بيانات الزبائن
        </h1>
        <p className="text-white/60 font-bold text-lg">عرض وإدارة معلومات جميع الزبائن الذين قاموا بالطلب.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1 bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4">
          <Search className="text-white/20 mr-2" size={20} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="البحث باسم الزبون أو رقم الهاتف..."
            className="flex-1 bg-transparent border-none text-white focus:outline-none placeholder:text-white/20 font-bold"
          />
        </div>
        <div className="md:w-48 relative" ref={filterRef}>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="w-full bg-[#1e293b] p-4 rounded-2xl border border-white/5 flex items-center gap-4 transition-all hover:border-secondary/20"
          >
            <Filter className={genderFilter !== 'all' ? "text-secondary" : "text-white/20"} size={20} />
            <span className="flex-1 text-right font-black text-white">
              {genderFilter === 'all' ? "كل الزبائن" : genderFilter}
            </span>
            <ChevronDown size={16} className={`text-white/20 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence mode="popLayout">
            {isFilterOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full right-0 left-0 mt-2 bg-[#1e293b] border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden backdrop-blur-xl"
              >
                {[
                  { id: 'all', label: 'كل الزبائن', icon: Users, color: 'text-white' },
                  { id: 'ذكر', label: 'ذكر', icon: User, color: 'text-blue-500' },
                  { id: 'أنثى', label: 'أنثى', icon: User, color: 'text-pink-500' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setGenderFilter(opt.id);
                      setIsFilterOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-5 py-4 text-right transition-colors hover:bg-white/5 ${
                      genderFilter === opt.id ? "bg-white/10" : ""
                    }`}
                  >
                    <opt.icon size={18} className={opt.color} />
                    <span className={`font-black text-sm ${genderFilter === opt.id ? 'text-secondary' : 'text-white/60'}`}>{opt.label}</span>
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

      {/* Customers List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-white/60 font-bold text-lg">جاري تحميل بيانات الزبائن...</p>
        </div>
      ) : (
        <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
          <div className="overflow-x-auto overflow-y-hidden relative z-10">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-6">الزبون</th>
                  <th className="px-8 py-6">معلومات التواصل</th>
                  <th className="px-8 py-6">الجنس</th>
                  <th className="px-8 py-6">إحصائيات</th>
                  <th className="px-8 py-6">آخر طلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredCustomers.map((customer, index) => (
                    <motion.tr 
                      key={customer.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="hover:bg-white/10 transition-colors group cursor-default"
                    >
                      {/* Name & City */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-inner group-hover:scale-110 transition-transform">
                            <User size={24} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-lg text-white group-hover:text-secondary transition-colors line-clamp-1">{customer.name}</span>
                            <span className="text-xs text-white/40 font-bold flex items-center gap-1">
                              {customer.city}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-8 py-6">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white/60 font-black tracking-wider">{customer.phone}</span>
                            <a 
                              href={getWhatsAppLink(customer.phone)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 px-2 bg-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all rounded-md flex items-center gap-1 text-[10px] font-black text-emerald-400 border border-emerald-500/20 shadow-lg shadow-emerald-500/10"
                            >
                              <MessageCircle size={10} />
                              واتساب
                            </a>
                          </div>
                          {customer.email && (
                            <div className="flex items-center gap-2 text-white/30 text-xs">
                              <Mail size={12} />
                              <span className="font-bold">{customer.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Gender */}
                      <td className="px-8 py-6">
                        {customer.gender ? (
                          <span className={`inline-flex items-center justify-center px-5 py-2 rounded-full text-[12px] font-black uppercase tracking-widest shadow-lg ${
                            customer.gender === 'ذكر' 
                              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-blue-500/10" 
                              : "bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-pink-500/10"
                          }`}>
                            <span className="ml-2 text-lg leading-none">{customer.gender === 'ذكر' ? '♂' : '♀'}</span>
                            {customer.gender}
                          </span>
                        ) : (
                          <span className="text-white/40 font-black text-[11px] uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
                            غير محدد
                          </span>
                        )}
                      </td>

                      {/* Stats */}
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <ShoppingBag size={14} className="text-secondary" />
                            <span className="font-black text-lg text-secondary">{customer.orderCount} طلبات</span>
                          </div>
                          <span className="text-[10px] text-white/20 font-bold uppercase tracking-widest">إجمالي الإنفاق: {customer.totalSpent.toFixed(2)} د.ا</span>
                        </div>
                      </td>

                      {/* Last Order */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-white/60 font-bold text-sm">
                          <Calendar size={14} className="text-white/20" />
                          {customer.lastOrderDate ? new Date(customer.lastOrderDate.seconds * 1000).toLocaleDateString("ar-EG") : "---"}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-32 text-center text-white/20 font-black text-xl">لا يوجد زبائن يطابقون هذا البحث</td>
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
