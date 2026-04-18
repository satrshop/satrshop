import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "دليل المقاسات - اختر المقاس المناسب",
  description: "دليل مقاسات ملابس متجر سطر. جميع منتجاتنا بتصميم Oversize مريح يناسب جلسات البرمجة الطويلة. اكتشف مقاسك المثالي بسهولة.",
  alternates: {
    canonical: "/size-guide",
  },
  openGraph: {
    title: "دليل المقاسات | متجر سطر",
    description: "اكتشف المقاس المناسب لك. تصميم Oversize مريح لجلسات البرمجة.",
    url: "/size-guide",
    type: "website",
  },
};

export default function SizeGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
