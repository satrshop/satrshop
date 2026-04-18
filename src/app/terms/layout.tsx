import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الأحكام والشروط",
  description: "الأحكام والشروط المنظمة لاستخدام متجر سطر. تعرف على حقوقك وواجباتك كعميل وفقاً لقوانين التجارة الإلكترونية في المملكة الأردنية الهاشمية.",
  alternates: {
    canonical: "/terms",
  },
  openGraph: {
    title: "الأحكام والشروط | متجر سطر",
    description: "الشروط المنظمة لتقديم خدماتنا وفقاً لقوانين الأردن.",
    url: "/terms",
    type: "website",
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
