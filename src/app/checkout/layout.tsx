import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "إتمام الطلب",
  description: "أكمل طلبك من متجر سطر. توصيل لجميع محافظات الأردن. الدفع نقداً عند الاستلام.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
