"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/models/product";
import { adminFetch } from "@/lib/api/admin-client";
import { motion } from "framer-motion";
import { 
  Search, 
  Loader2, 
  Save, 
  CheckCircle2,
  AlertTriangle,
  PackageX,
  PackageCheck,
  Minus,
  Plus
} from "lucide-react";
import Image from "next/image";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedStocks, setEditedStocks] = useState<Record<string, number>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [allSaved, setAllSaved] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await adminFetch<{ products: Product[] }>("/api/admin/products");
      setProducts(data.products);
    } catch (err) {
      console.error("Failed to load products:", err);
    }
    setLoading(false);
  }

  const handleStockChange = (productId: string, newValue: number) => {
    setEditedStocks(prev => ({ ...prev, [productId]: Math.max(0, newValue) }));
  };

  const handleSave = async (productId: string) => {
    const newStock = editedStocks[productId];
    if (newStock === undefined) return;

    setSavingId(productId);
    try {
      await adminFetch(`/api/admin/products/${productId}/stock`, {
        method: "PUT",
        body: JSON.stringify({ stock: newStock }),
      });
      setProducts(prev =>
        prev.map(p => p.id === productId ? { ...p, stock: newStock } : p)
      );
      setEditedStocks(prev => {
        const next = { ...prev };
        delete next[productId];
        return next;
      });
      setSavedId(productId);
      setTimeout(() => setSavedId(null), 2000);
    } catch {
      alert("فشل حفظ التعديل.");
    }
    setSavingId(null);
  };

  const handleSaveAll = async () => {
    const editIds = Object.keys(editedStocks);
    if (editIds.length === 0) return;

    setIsSavingAll(true);
    try {
      const promises = editIds.map(id =>
        adminFetch(`/api/admin/products/${id}/stock`, {
          method: "PUT",
          body: JSON.stringify({ stock: editedStocks[id] }),
        })
      );
      await Promise.all(promises);
      
      setProducts(prev => prev.map(p => 
        editedStocks[p.id] !== undefined ? { ...p, stock: editedStocks[p.id] } : p
      ));
      setEditedStocks({});
      setAllSaved(true);
      setTimeout(() => setAllSaved(false), 3000);
    } catch (error) {
      console.error("Bulk save error:", error);
      alert("حدث خطأ أثناء حفظ التعديلات.");
    } finally {
      setIsSavingAll(false);
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
  const totalStock = products.reduce((acc, p) => acc + p.stock, 0);

  const getStockColor = (stock: number) => {
    if (stock === 0) return "text-red-400";
    if (stock <= 5) return "text-amber-400";
    return "text-emerald-400";
  };

  const getStockBg = (stock: number) => {
    if (stock === 0) return "bg-red-500/10 border-red-500/20";
    if (stock <= 5) return "bg-amber-500/10 border-amber-500/20";
    return "bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2">إدارة المخزون</h1>
          <p className="text-white/60 font-bold">تتبع وتحديث الكميات المتاحة لكل منتج.</p>
        </div>

        {Object.keys(editedStocks).length > 0 && (
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={handleSaveAll}
            disabled={isSavingAll}
            className="bg-secondary text-primary px-8 py-4 rounded-2xl font-black flex items-center gap-3 hover:bg-white transition-all shadow-xl shadow-secondary/20 disabled:opacity-50"
          >
            {isSavingAll ? (
              <Loader2 size={24} className="animate-spin" />
            ) : allSaved ? (
              <>
                <CheckCircle2 size={24} />
                تم حفظ الكل بنجاح!
              </>
            ) : (
              <>
                <Save size={24} />
                حفظ تعديلات الكل ({Object.keys(editedStocks).length})
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
            <PackageCheck size={24} />
          </div>
          <div>
            <p className="text-white/40 font-bold text-sm">إجمالي المخزون</p>
            <p className="text-2xl font-black text-emerald-400">{totalStock} قطعة</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-white/40 font-bold text-sm">كمية منخفضة</p>
            <p className="text-2xl font-black text-amber-400">{lowStockCount} منتج</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1e293b] p-6 rounded-2xl border border-white/5 flex items-center gap-4"
        >
          <div className="w-12 h-12 bg-red-500/10 text-red-400 rounded-xl flex items-center justify-center">
            <PackageX size={24} />
          </div>
          <div>
            <p className="text-white/40 font-bold text-sm">نفذت الكمية</p>
            <p className="text-2xl font-black text-red-400">{outOfStockCount} منتج</p>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="bg-[#1e293b] p-4 rounded-[2rem] border border-white/5 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث باسم المنتج أو التصنيف..."
            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:outline-none focus:border-secondary transition-all"
          />
        </div>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-white/60 font-bold">جاري تحميل المخزون...</p>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-white/5 text-white/40 text-sm font-bold uppercase tracking-widest">
                  <th className="px-6 py-5">المنتج</th>
                  <th className="px-6 py-5">التصنيف</th>
                  <th className="px-6 py-5">السعر</th>
                  <th className="px-6 py-5">التكلفة</th>
                  <th className="px-6 py-5">الكمية</th>
                  <th className="px-6 py-5">الحالة</th>
                  <th className="px-6 py-5">تعديل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredProducts.map((product) => {
                  const currentStock = editedStocks[product.id] ?? product.stock;
                  const isEdited = editedStocks[product.id] !== undefined;
                  const isSaving = savingId === product.id;
                  const isSaved = savedId === product.id;

                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      {/* Product Info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                            <Image src={product.image} alt={product.name} fill sizes="48px" className="object-cover" />
                          </div>
                          <span className="font-bold text-white/90 line-clamp-1">{product.name}</span>
                        </div>
                      </td>
                      {/* Category */}
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-white/5 px-3 py-1 rounded-full text-white/50">{product.category}</span>
                      </td>
                      {/* Price */}
                      <td className="px-6 py-4 font-black text-secondary">{product.price.toFixed(2)} د.ا</td>
                      {/* Cost Price */}
                      <td className="px-6 py-4 font-bold text-amber-500/60">{(product.costPrice ?? 0).toFixed(2)} د.ا</td>
                      {/* Stock Quantity */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleStockChange(product.id, currentStock - 1)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-all"
                          >
                            <Minus size={14} />
                          </button>
                          <input
                            type="number"
                            min="0"
                            value={currentStock}
                            onChange={(e) => handleStockChange(product.id, parseInt(e.target.value) || 0)}
                            className={`w-16 text-center bg-white/5 border rounded-lg py-1.5 font-black text-lg focus:outline-none focus:border-secondary transition-all ${isEdited ? 'border-secondary text-secondary' : 'border-white/10 text-white'}`}
                          />
                          <button
                            onClick={() => handleStockChange(product.id, currentStock + 1)}
                            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 transition-all"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black border ${getStockBg(currentStock)}`}>
                          <span className={`w-2 h-2 rounded-full ${currentStock === 0 ? 'bg-red-400' : currentStock <= 5 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                          <span className={getStockColor(currentStock)}>
                            {currentStock === 0 ? "نفذت الكمية" : currentStock <= 5 ? "كمية منخفضة" : "متوفر"}
                          </span>
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        {isEdited && (
                          <button
                            onClick={() => handleSave(product.id)}
                            disabled={isSaving}
                            className="flex items-center gap-2 bg-secondary/20 text-secondary px-4 py-2 rounded-xl font-bold text-sm hover:bg-secondary/30 transition-all disabled:opacity-50"
                          >
                            {isSaving ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Save size={14} />
                            )}
                            حفظ
                          </button>
                        )}
                        {isSaved && (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold text-sm">
                            <CheckCircle2 size={14} />
                            تم الحفظ
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-20 text-center text-white/40 font-bold">
                      لا توجد منتجات مطابقة للبحث
                    </td>
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
