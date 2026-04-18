import type { Metadata } from "next";

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
  return children;
}
