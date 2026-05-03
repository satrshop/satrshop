"use client";

import { useState, useEffect } from "react";
import { getCategories } from "@/lib/db/products";
import { adminFetch } from "@/lib/api/admin-client";
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
  PackageCheck,
  Palette,
  Ruler,
  Plus,
  X
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
    images: [] as string[],
    description: "",
    rating: 5.0,
    isNew: false,
    stock: "10",
    costPrice: "",
    hasColors: false,
    colors: [{ name: "", code: "#000000" }],
    hasSizes: false,
    sizes: ["S", "M", "L", "XL"],
    isBestSeller: false,
    isFeatured: false
  });

  const [uploadKey, setUploadKey] = useState(Date.now());

  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    async function fetchCats() {
      const cats = await getCategories();
      setCategories(cats);
    }
    fetchCats();
  }, []);

  useEffect(() => {
    async function loadProduct() {
      if (typeof id !== 'string') return;
      try {
        const res = await adminFetch<{ product: any }>(`/api/admin/products/${id}`);
        const data = res.product;
        if (data) {
          setFormData({
            name: data.name,
            price: data.price.toString(),
            category: data.category,
            image: data.image,
            images: data.images || (data.image ? [data.image] : []),
            description: data.description || "",
            rating: data.rating,
            isNew: data.isNew || false,
            stock: data.stock.toString(),
            costPrice: (data.costPrice ?? 0).toString(),
            hasColors: data.hasColors || false,
            colors: data.colors || [{ name: "", code: "#000000" }],
            hasSizes: data.hasSizes || false,
            sizes: data.sizes || ["S", "M", "L", "XL"],
            isBestSeller: data.isBestSeller || false,
            isFeatured: data.isFeatured || false
          });
        }
      } catch (err) {
        console.error("Failed to load product:", err);
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
      category: isAddingNew ? newCategory : formData.category,
      price: parseFloat(formData.price),
      rating: parseFloat(formData.rating.toString()),
      stock: parseInt(formData.stock) || 10,
      costPrice: parseFloat(formData.costPrice || "0"),
      hasColors: formData.hasColors,
      colors: formData.hasColors ? formData.colors : [],
      hasSizes: formData.hasSizes,
      sizes: formData.hasSizes ? formData.sizes : [],
      images: formData.images,
      isBestSeller: formData.isBestSeller,
      isNew: formData.isNew,
      isFeatured: formData.isFeatured
    };

    try {
      await adminFetch(`/api/admin/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(productData),
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/products");
      }, 1500);
    } catch {
      alert("فشل تحديث المنتج. حاول مرة أخرى.");
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? target.checked : value
    }));
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: "", code: "#000000" }]
    }));
  };

  const removeColor = (index: number) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const handleColorChange = (index: number, field: "name" | "code", value: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((c, i) => i === index ? { ...c, [field]: value } : c)
    }));
  };

  const handleSizeToggle = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size) 
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleAddImage = (url: string) => {
    setFormData(prev => {
      const newImages = [...prev.images, url];
      return {
        ...prev,
        images: newImages,
        image: newImages[0] // Set first image as main
      };
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => {
      const newImages = prev.images.filter((_, i) => i !== index);
      return {
        ...prev,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : ""
      };
    });
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                      <Tag size={16} className="text-secondary" />
                      التصنيف
                    </label>
                    <button 
                      type="button"
                      onClick={() => setIsAddingNew(!isAddingNew)}
                      className="text-[10px] font-black uppercase tracking-widest text-secondary hover:text-white transition-colors"
                    >
                      {isAddingNew ? "إلغاء المخصص" : "إضافة تصنيف جديد"}
                    </button>
                  </div>
                  
                  {isAddingNew ? (
                    <motion.input 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      required
                      type="text"
                      placeholder="اسم التصنيف الجديد..."
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-white/5 border border-secondary/50 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all"
                    />
                  ) : (
                    <select 
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-4 px-5 text-white focus:outline-none focus:border-secondary transition-all appearance-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  )}
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

              {/* Variants Toggles */}
              <div className="flex flex-wrap gap-8 pt-4 border-t border-white/5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.isFeatured ? 'bg-emerald-500' : 'bg-white/10'}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isFeatured ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-white/80 font-bold text-sm">في الرئيسية</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      name="isNew"
                      checked={formData.isNew}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.isNew ? 'bg-secondary' : 'bg-white/10'}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isNew ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-white/80 font-bold text-sm">منتج جديد</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      name="isBestSeller"
                      checked={formData.isBestSeller}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.isBestSeller ? 'bg-amber-500' : 'bg-white/10'}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.isBestSeller ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-white/80 font-bold text-sm">الأكثر مبيعاً</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      name="hasColors"
                      checked={formData.hasColors}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.hasColors ? 'bg-secondary' : 'bg-white/10'}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.hasColors ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-white/80 font-bold text-sm">تفعيل الألوان</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox"
                      name="hasSizes"
                      checked={formData.hasSizes}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className={`w-12 h-6 rounded-full transition-colors ${formData.hasSizes ? 'bg-secondary' : 'bg-white/10'}`} />
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${formData.hasSizes ? 'translate-x-6' : ''}`} />
                  </div>
                  <span className="text-white/80 font-bold text-sm">تفعيل المقاسات</span>
                </label>
              </div>

              {/* Colors Management */}
              {formData.hasColors && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                    <Palette size={16} className="text-secondary" />
                    إدارة الألوان
                  </label>
                  <div className="space-y-3">
                    {formData.colors.map((color, index) => (
                      <div key={index} className="flex gap-3 items-center">
                        <input 
                          type="text"
                          placeholder="اسم اللون (مثلاً: أحمر)"
                          value={color.name}
                          onChange={(e) => handleColorChange(index, "name", e.target.value)}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-secondary transition-all"
                        />
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10">
                          <input 
                            type="color"
                            value={color.code}
                            onChange={(e) => handleColorChange(index, "code", e.target.value)}
                            className="absolute inset-0 w-[200%] h-[200%] -translate-x-1/4 -translate-y-1/4 cursor-pointer"
                          />
                        </div>
                        {formData.colors.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => removeColor(index)}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-all"
                          >
                            <X size={18} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={addColor}
                      className="w-full py-3 bg-white/5 border border-dashed border-white/20 rounded-xl text-white/60 text-sm font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      إضافة لون آخر
                    </button>
                  </div>
                </div>
              )}

              {/* Sizes Management */}
              {formData.hasSizes && (
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                    <Ruler size={16} className="text-secondary" />
                    إدارة المقاسات
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handleSizeToggle(size)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all border-2 ${
                          formData.sizes.includes(size)
                            ? "bg-secondary/20 border-secondary text-secondary"
                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Image Upload */}
              <div className="space-y-4">
                <label className="text-white/80 font-bold text-sm mr-2 flex items-center gap-2">
                  <ImageIcon size={16} className="text-secondary" />
                  صور المنتج
                </label>
                {!loading && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative aspect-[4/5] bg-white/5 rounded-[2rem] overflow-hidden group border border-white/10">
                        <Image src={url} alt={`Product ${index + 1}`} fill sizes="200px" className="object-cover" />
                        <button 
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-4 left-4 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                        >
                          <X size={16} />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-4 right-4 bg-secondary text-primary px-3 py-1 rounded-lg text-xs font-bold shadow-lg">الرئيسية</span>
                        )}
                      </div>
                    ))}
                    
                    <ImageUpload 
                      key={uploadKey}
                      onUploadComplete={(url) => {
                        if (url) {
                          handleAddImage(url);
                          setUploadKey(Date.now());
                        }
                      }}
                    />
                  </div>
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
            <div className="relative aspect-[4/5] bg-white/5 rounded-2xl overflow-hidden mb-6 border border-white/10">
              {formData.image ? (
                <Image src={formData.image} alt="Preview" fill sizes="(max-width: 768px) 100vw, 400px" className="object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/10 space-y-4">
                  <ImageIcon size={64} />
                  <span className="font-bold">سيظهر المنتج هنا</span>
                </div>
              )}
            </div>
            <div className="space-y-4 text-right">
              <p className="text-secondary font-black text-sm">{isAddingNew ? (newCategory || "تصنيف جديد") : formData.category}</p>
              <h4 className="text-2xl font-black">{formData.name}</h4>
              <p className="text-3xl font-black text-white/90">{parseFloat(formData.price || "0").toFixed(2)} د.ا</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
