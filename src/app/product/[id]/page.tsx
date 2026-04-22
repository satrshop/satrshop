import { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
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
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://satrshop.com";

  if (!product) {
    return {
      title: "المنتج غير موجود | متجر سطر",
    };
  }

  const description = product.description || `تمتع بالأناقة والراحة مع ${product.name}. خامات قطنية 100% تضمن لك الراحة طوال اليوم.`;

  return {
    title: `${product.name} | متجر سطر`,
    description,
    alternates: {
      canonical: `/product/${product.id}`,
    },
    openGraph: {
      title: `${product.name} - ${product.price.toFixed(2)} د.ا | متجر سطر`,
      description,
      url: `${siteUrl}/product/${product.id}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
      type: "website",
      siteName: "متجر سطر",
      locale: "ar_JO",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} - ${product.price.toFixed(2)} د.ا | متجر سطر`,
      description,
      images: [product.image],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(id);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://satrshop.com";

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
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

  // Product JSON-LD Schema — enables Google Rich Snippets (price, availability, image)
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.description || `${product.name} من متجر سطر - المتجر التقني الأول للمبرمجين في الأردن.`,
    "brand": {
      "@type": "Brand",
      "name": "متجر سطر"
    },
    "offers": {
      "@type": "Offer",
      "url": `${siteUrl}/product/${product.id}`,
      "priceCurrency": "JOD",
      "price": product.price.toFixed(2),
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "متجر سطر"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "JO"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "d" },
          "transitTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 5, "unitCode": "d" }
        }
      }
    },
    "category": product.category,
  };

  // BreadcrumbList JSON-LD — helps Google display breadcrumbs in search results
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "الرئيسية",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "المتجر",
        "item": `${siteUrl}/shop`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": product.name,
        "item": `${siteUrl}/product/${product.id}`
      }
    ]
  };

  return (
    <div className="min-h-screen bg-background">
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Script
        id="breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
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
