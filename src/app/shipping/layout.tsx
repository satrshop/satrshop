import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "الشحن والتوصيل - معلومات التوصيل والأسعار",
  description: "معلومات الشحن والتوصيل لمتجر سطر. توصيل لعمّان خلال 1-3 أيام وباقي المحافظات 3-5 أيام. شحن مجاني للطلبات فوق 35 دينار أردني. عبر أرامكس.",
  alternates: {
    canonical: "/shipping",
  },
  openGraph: {
    title: "الشحن والتوصيل | متجر سطر",
    description: "توصيل سريع لجميع محافظات الأردن. شحن مجاني للطلبات فوق 35 د.ا.",
    url: "/shipping",
    type: "website",
  },
};

export default function ShippingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
