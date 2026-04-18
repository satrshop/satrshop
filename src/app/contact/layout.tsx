import type { Metadata } from "next";

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
  return children;
}
