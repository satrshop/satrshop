"use client";

import { useState, useEffect } from "react";
import { getProductById, updateProduct } from "@/lib/db/products";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowRight, 
  Save, 
  Type, 
  Tag, 
  DollarSign, 
  Image as ImageIcon, 
  AlignLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  PackageCheck
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ImageUpload from "@/components/admin/ImageUpload";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "هوديز",
    image: "",
    description: "",
    rating: 5.0,
    isNew: false,
    stock: "10",
    costPrice: ""
  });

  useEffect(() => {
    async function loadProduct() {
      if (typeof id !== 'string') return;
      const data = await getProductById(id);
      if (data) {
        setFormData({
          name: data.name,
          price: data.price.toString(),
          category: data.category,
          image: data.image,
          description: data.description || "",
          rating: data.rating,
          isNew: data.isNew || false,
          stock: data.stock.toString(),
          costPrice: (data.costPrice ?? 0).toString()
        });
      }
      setLoading(false);
    }
    loadProduct();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating.toString()),
      stock: parseInt(formData.stock) || 10,
      costPrice: parseFloat(formData.costPrice || "0")
    };

    const updated = await updateProduct(id as string, productData);
    if (updated) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } else {
      alert("فشل تحديث المنتج. حاول مرة أخرى.");
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as any;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as any).checked : value
    }));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
        <p className="text-white/60 font-bold">جاري تحميل بيانات المنتج...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/admin/products">
            <button className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all text-white/60">
              <ArrowRight size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black mb-1">تعديل المنتج</h1>
            <p className="text-white/60 font-bold">تحديث تفاصيل المنتج في المتجر.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1e293b] p-8 rounded-[2.5rem] border border-white/5 shadow-2xl space-y-6">
              {/* Product Name */}
              <div className="space-y-2">
                <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                  <Type size={16} className="text-secondary" />
                  اسم المنتج
                </label>
                <input 
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Price */}
                <div className="space-y-2">
                  <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                    <DollarSign size={16} className="text-secondary" />
                    السعر (د.ا)
                  </label>
                  <input 
                    required
                    type="number"
                    step="0.01"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all"
                  />
                </div>
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                    <Tag size={16} className="text-secondary" />
                    التصنيف
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all appearance-none"
                  >
                    <option value="هوديز">هوديز</option>
                    <option value="تيشرتات">تيشرتات</option>
                    <option value="جواكيت">جواكيت</option>
                    <option value="حقائب">حقائب</option>
                    <option value="إكسسوارات">إكسسوارات</option>
                  </select>
                </div>
              </div>

              {/* Cost Price */}
              <div className="space-y-2">
                <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                  <DollarSign size={16} className="text-amber-500" />
                  سعر التكلفة (د.ا)
                </label>
                <input 
                  required
                  type="number"
                  step="0.01"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={handleChange}
                  placeholder="15.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all"
                />
                <p className="text-[10px] text-white/30 mr-2">هذا السعر لن يظهر للزبون، يستخدم فقط لحساب الأرباح.</p>
              </div>

              {/* Stock Quantity */}
              <div className="space-y-2">
                <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                  <PackageCheck size={16} className="text-secondary" />
                  الكمية المتاحة
                </label>
                <input 
                  required
                  type="number"
                  min="0"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  placeholder="10"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all"
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-secondary" />
                  صورة المنتج
                </label>
                {!loading && (
                   <ImageUpload 
                     onUploadComplete={(url) => setFormData(prev => ({ ...prev, image: url }))}
                     initialValue={formData.image}
                   />
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                  <AlignLeft size={16} className="text-secondary" />
                  وصف المنتج
                </label>
                <textarea 
                  required
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all resize-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={saving || success || !formData.image}
              className="w-full bg-secondary text-primary py-5 rounded-[2rem] font-black text-xl shadow-xl shadow-secondary/10 hover:bg-white transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={24} className="animate-spin" />
              ) : success ? (
                <>
                  <CheckCircle2 size={24} />
                  تم التحديث بنجاح
                </>
              ) : (
                <>
                  <Save size={24} />
                  حفظ التعديلات
                </>
              )}
            </button>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-5 space-y-6">
          <h3 className="text-white/40 font-black text-lg mr-4 uppercase tracking-widest">معاينة</h3>
          <div className="bg-[#1e293b] p-6 rounded-[2.5rem] border border-white/10">
            <div className="relative aspect-[4/5] bg-white/5 rounded-2xl overflow-hidden mb-6">
              {formData.image && (
                <Image src={formData.image} alt="Preview" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
              )}
            </div>
            <div className="space-y-4 text-right">
              <p className="text-secondary font-black text-sm">{formData.category}</p>
              <h4 className="text-2xl font-black">{formData.name}</h4>
              <p className="text-3xl font-black text-white/90">{parseFloat(formData.price || "0").toFixed(2)} د.ا</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
