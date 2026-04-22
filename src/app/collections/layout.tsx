import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "المجموعات التقنية - استكشف تشكيلاتنا",
  description: "استكشف مجموعات متجر سطر المصممة للمبرمجين: مجموعة الخريف التقنية، مجموعة Dark Mode، والأساسيات اليومية. كل مجموعة بطابع فريد يعكس هويتك البرمجية.",
  alternates: {
    canonical: "/collections",
  },
  openGraph: {
    title: "المجموعات التقنية | متجر سطر",
    description: "استكشف تصنيفاتنا المصممة لتناسب أسلوب حياتك البرمجي والتقني.",
    url: "/collections",
    type: "website",
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://satrshop.com";
  
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
        "name": "الأقسام",
        "item": `${siteUrl}/collections`
      }
    ]
  };

  return (
    <>
      <Script
        id="collections-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      {children}
    </>
  );
}
