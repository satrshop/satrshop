import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "المتجر التقني - تسوق ملابس المبرمجين",
  description: "تصفح تشكيلة متجر سطر الكاملة من هوديز، تيشرتات، جواكيت وإكسسوارات مصممة خصيصاً للمبرمجين وطلبة تكنولوجيا المعلومات. توصيل لجميع محافظات الأردن.",
  alternates: {
    canonical: "/shop",
  },
  openGraph: {
    title: "المتجر التقني | متجر سطر",
    description: "تصفح تشكيلة متجر سطر الكاملة. ملابس وإكسسوارات تقنية بجودة عالية.",
    url: "/shop",
    type: "website",
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://satrshop.com";

  const shopBreadcrumbJsonLd = {
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
      }
    ]
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "المتجر التقني - متجر سطر",
    "description": "تصفح تشكيلة متجر سطر الكاملة من المنتجات التقنية للمبرمجين.",
    "url": `${siteUrl}/shop`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "متجر سطر",
      "url": siteUrl
    }
  };

  return (
    <>
      <Script
        id="shop-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(shopBreadcrumbJsonLd) }}
      />
      <Script
        id="shop-collection-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      {children}
    </>
  );
}
