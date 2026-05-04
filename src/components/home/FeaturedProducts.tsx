"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";
import { getProducts } from "@/lib/db/products";
import { Product } from "@/types/models/product";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const products = await getProducts();
        const featured = products.filter(p => p.isFeatured);
        // Take the first 4 featured for the homepage, if none fallback to newest 4
        setFeaturedProducts(featured.length > 0 ? featured.slice(0, 4) : products.slice(0, 4));
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchFeatured();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-8 sm:mb-12">
        <div className="text-right w-full sm:w-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 text-right">وصل حديثاً</h2>
          <p className="text-muted-foreground text-base sm:text-lg text-right">أحدث الإصدارات الخاصة بالموسم التقني الجديد.</p>
        </div>
        <Link 
          href="/shop" 
          className="hidden sm:flex group items-center gap-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary px-6 py-2.5 rounded-2xl font-black transition-all border border-secondary/20 hover:shadow-lg hover:shadow-secondary/20"
        >
          عرض كل المنتجات
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[4/5] bg-primary/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((prod, idx) => (
              <ProductCard key={prod.id ?? idx} product={prod} index={idx} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-primary/5 rounded-3xl">
              <p className="text-muted-foreground">لا يوجد منتجات متاحة حالياً.</p>
            </div>
          )}
        </div>
      )}

      <div className="mt-10 sm:hidden flex justify-center">
        <Link 
          href="/shop" 
          className="flex w-full group items-center justify-center gap-2 bg-secondary/10 hover:bg-secondary text-secondary hover:text-primary px-6 py-3.5 rounded-2xl font-black transition-all border border-secondary/20"
        >
          عرض كل المنتجات
        </Link>
      </div>
    </section>
  );
}
