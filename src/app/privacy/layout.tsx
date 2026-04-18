import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية - حماية البيانات",
  description: "سياسة الخصوصية لمتجر سطر. نحمي بياناتك الشخصية ونشفرها بالكامل. لا نشارك معلوماتك مع أطراف ثالثة. تعرف على حقوقك وكيف نحمي خصوصيتك.",
  alternates: {
    canonical: "/privacy",
  },
  openGraph: {
    title: "سياسة الخصوصية | متجر سطر",
    description: "نحمي بياناتك ونشفرها بالكامل. تعرف على سياسة الخصوصية.",
    url: "/privacy",
    type: "website",
  },
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
