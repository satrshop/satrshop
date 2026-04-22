import type { Metadata } from "next";
import Script from "next/script";

export const metadata: Metadata = {
  title: "تواصل معنا - خدمة العملاء",
  description: "تواصل مع فريق متجر سطر للاستفسار عن المنتجات، المقاسات، أو حالة الطلب. فريقنا متواجد لمساعدتك عبر البريد الإلكتروني أو الهاتف. عمّان، الأردن.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "تواصل معنا | متجر سطر",
    description: "فريق سطر متواجد دائماً لمساعدتك. استفسر عن المنتجات أو الطلبات.",
    url: "/contact",
    type: "website",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://satrshop.com";

  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "تواصل معنا - متجر سطر",
    "url": `${siteUrl}/contact`,
    "mainEntity": {
      "@type": "Organization",
      "name": "متجر سطر",
      "url": siteUrl,
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+962798419463",
        "contactType": "customer service",
        "email": "satrshopp@gmail.com",
        "availableLanguage": ["Arabic", "English"],
        "areaServed": "JO"
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "عمّان",
        "addressCountry": "JO"
      }
    }
  };

  return (
    <>
      <Script
        id="contact-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      {children}
    </>
  );
}
