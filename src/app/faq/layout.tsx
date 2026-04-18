import type { Metadata } from "next";
import Script from "next/script";

const FAQS = [
  { q: "ما هي طرق الدفع المتاحة؟", a: "حالياً، نعتمد نظام الدفع نقداً عند الاستلام (Cash on Delivery) لضمان أعلى مستويات الأمان والرضا لعملائنا." },
  { q: "هل الخامات مريحة أثناء جلسات البرمجة الطويلة؟", a: "بالتأكيد! حرصنا في سطر على اختيار خامات قطنية 100٪ توفر راحة فائقة لتصاحبك لساعات البرمجة والعمل الطويلة دون أي إزعاج." },
  { q: "كيف أستطيع تتبع طلبي؟", a: "سنقوم بالتواصل معك عبر الهاتف لتأكيد موعد التوصيل ومكان التسليم. نحن نحرص على تسليم الطلب في أسرع وقت ممكن." },
  { q: "ما هي المناطق التي يغطيها المتجر؟", a: "متجر سطر يغطي حالياً كافة محافظات المملكة الأردنية الهاشمية، مع توصيل سريع وموثوق." }
];

export const metadata: Metadata = {
  title: "الأسئلة الشائعة - إجابات سريعة",
  description: "إجابات على أهم الأسئلة حول متجر سطر: طرق الدفع، الشحن والتوصيل، جودة الخامات، تتبع الطلبات، والمناطق المغطاة في الأردن.",
  alternates: {
    canonical: "/faq",
  },
  openGraph: {
    title: "الأسئلة الشائعة | متجر سطر",
    description: "كل ما تحتاج معرفته عن التسوق في متجر سطر.",
    url: "/faq",
    type: "website",
  },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <>
      <Script
        id="faq-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
