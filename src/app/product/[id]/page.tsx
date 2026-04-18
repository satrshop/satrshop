import { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import Header from "@/components/layout/Header";
import { getProductById, getProducts } from "@/lib/db/products";
import ProductDetailClient from "./ProductDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "المنتج غير موجود | متجر سطر",
    };
  }

  return {
    title: `${product.name} | متجر سطر`,
    description: product.description || `تمتع بالأناقة والراحة مع ${product.name}. خامات قطنية 100% تضمن لك الراحة طوال اليوم.`,
    openGraph: {
      title: `${product.name} | متجر سطر`,
      description: product.description || `المتجر التقني الأول للمبرمجين في الأردن.`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | متجر سطر`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FDF4E3]">
        <Header />
        <div className="text-center py-40 px-4">
          <h1 className="text-3xl font-black text-primary mb-4">المنتج غير موجود</h1>
          <p className="text-muted-foreground mb-8">عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه.</p>
          <a href="/shop" className="bg-primary text-white px-8 py-3 rounded-full font-bold inline-block hover:bg-primary/90 transition-all">العودة للمتجر</a>
        </div>
      </div>
    );
  }

  // Load related products on the server
  const allProducts = await getProducts();
  const relatedProducts = allProducts
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FDF4E3]">
      <Header />
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      }>
        <ProductDetailClient product={product} relatedProducts={relatedProducts} />
      </Suspense>
    </div>
  );
}
