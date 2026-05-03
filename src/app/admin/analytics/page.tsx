"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Eye, ShoppingBag, BarChart3 } from "lucide-react";
import { adminFetch } from "@/lib/api/admin-client";
import { Product } from "@/types/models/product";
import Image from "next/image";

interface ProductWithViews extends Product {
  views?: number;
}

export default function AnalyticsPage() {
  const [products, setProducts] = useState<ProductWithViews[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ products: ProductWithViews[] }>("/api/admin/products");
      
      // Sort by views descending
      const sortedProducts = data.products
        .map(p => ({ ...p, views: p.views || 0 }))
        .sort((a, b) => b.views! - a.views!);
        
      setProducts(sortedProducts);
    } catch (err) {
      console.error("Failed to load analytics:", err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-secondary" />
      </div>
    );
  }

  // Calculate the maximum views to set the bar chart scale
  const maxViews = Math.max(...products.map(p => p.views || 0), 1);
  const totalViews = products.reduce((acc, p) => acc + (p.views || 0), 0);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BarChart3 className="text-secondary" size={32} />
            تحليلات المنتجات
          </h1>
          <p className="text-white/60 mt-2 font-medium">اكتشف أكثر المنتجات التي تلفت انتباه زوار المتجر.</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-all" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-bold mb-1">إجمالي الزيارات للمنتجات</p>
              <h3 className="text-4xl font-black text-white">{totalViews}</h3>
            </div>
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400">
              <Eye size={28} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex-1 ml-4">
              <p className="text-white/60 text-sm font-bold mb-1">المنتج الأكثر مشاهدة</p>
              <h3 className="text-xl font-black text-white line-clamp-2 leading-tight">
                {products[0]?.views && products[0].views > 0 ? products[0].name : "لا يوجد"}
              </h3>
            </div>
            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-400">
              <TrendingUp size={28} />
            </div>
          </div>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden group">
          <div className="absolute -left-6 -top-6 w-32 h-32 bg-secondary/10 rounded-full blur-3xl group-hover:bg-secondary/20 transition-all" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-white/60 text-sm font-bold mb-1">إجمالي المنتجات المعروضة</p>
              <h3 className="text-4xl font-black text-white">{products.length}</h3>
            </div>
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary">
              <ShoppingBag size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-[#1e293b] p-8 rounded-[2rem] border border-white/5 shadow-xl relative overflow-hidden">
        <h2 className="text-xl font-bold text-white mb-8 border-r-4 border-secondary pr-4">ترتيب المنتجات حسب الزيارات</h2>
        
        {products.length === 0 || maxViews === 0 ? (
          <div className="text-center py-10 text-white/40">لا توجد بيانات زيارات حتى الآن.</div>
        ) : (
          <div className="space-y-6">
            {products.slice(0, 10).map((product, index) => {
              const percentage = ((product.views || 0) / maxViews) * 100;
              return (
                <div key={product.id} className="group">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 font-black text-sm border border-white/10 group-hover:bg-secondary/20 group-hover:text-secondary group-hover:border-secondary/50 transition-all">
                      {index + 1}
                    </div>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        width={40} 
                        height={40} 
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div className="flex-1 flex justify-between items-center">
                      <span className="font-bold text-white/90 group-hover:text-white transition-colors">{product.name}</span>
                      <span className="font-mono text-secondary bg-secondary/10 px-3 py-1 rounded-lg text-sm font-bold">
                        {product.views || 0} زيارة
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="h-3 w-full bg-[#0f172a] rounded-full overflow-hidden mr-12 relative border border-white/5">
                    <div 
                      className="absolute right-0 top-0 h-full bg-gradient-to-l from-secondary to-[#8c6721] rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
