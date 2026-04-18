import type { Metadata } from "next";

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
  return children;
}
