"use client";

import { useState, useEffect } from "react";
import { getProducts, deleteProduct } from "@/lib/db/products";
import { Product } from "@/types/models/product";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Loader2,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  async function loadProducts() {
    setLoading(true);
    const data = await getProducts(true);
    setProducts(data);
    setLoading(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذه الخطوة.")) return;
    
    setIsDeleting(id);
    const success = await deleteProduct(id);
    if (success) {
      setProducts(prev => prev.filter(p => p.id !== id));
    } else {
      alert("فشل حذف المنتج. حاول مرة أخرى.");
    }
    setIsDeleting(null);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black mb-2">إدارة المنتجات</h1>
          <p className="text-white/60 font-bold">يمكنك إضافة، تعديل أو حذف منتجات المتجر من هنا.</p>
        </div>
        <Link href="/admin/products/new">
          <button className="flex items-center gap-2 bg-secondary text-primary px-8 py-4 rounded-2xl font-black text-lg hover:bg-white transition-all shadow-xl shadow-secondary/10">
            <Plus size={20} strokeWidth={3} />
            منتج جديد
          </button>
        </Link>
      </div>

      {/* Filters & Search */}
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

      {/* Products Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="w-10 h-10 text-secondary animate-spin" />
          <p className="text-white/60 font-bold">جاري تحميل قائمة المنتجات...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((product) => (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                key={product.id}
                className="bg-[#1e293b] rounded-[2rem] border border-white/5 overflow-hidden group hover:border-secondary/30 transition-all flex flex-col"
              >
                <div className="relative aspect-[4/5] bg-white/5">
                  <Image 
                    src={product.image} 
                    alt={product.name} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 300px"
                    className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" 
                  />
                  <div className="absolute top-4 right-4 bg-primary/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/10">
                    {product.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                  <p className="text-secondary font-black text-xl mb-6">{product.price.toFixed(2)} د.ا</p>
                  
                  <div className="mt-auto grid grid-cols-2 gap-3">
                    <Link href={`/admin/products/${product.id}/edit`}>
                      <button className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/5">
                        <Edit2 size={16} />
                        تعديل
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      disabled={isDeleting === product.id}
                      className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold py-3 rounded-xl transition-all border border-red-500/10 disabled:opacity-50"
                    >
                      {isDeleting === product.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      حذف
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-[#1e293b] rounded-[3rem] border border-white/5">
          <AlertCircle size={48} className="text-white/20 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white/60">لم نجد أي منتجات تطابق بحثك</h3>
          <button onClick={() => setSearchQuery("")} className="mt-4 text-secondary font-bold hover:underline">
            مسح البحث
          </button>
        </div>
      )}
    </div>
  );
}
