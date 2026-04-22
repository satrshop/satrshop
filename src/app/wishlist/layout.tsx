import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "قائمة المفضلة",
  description: "منتجاتك المفضلة في متجر سطر. أضف المنتجات التي تعجبك واحتفظ بها لوقت لاحق.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function WishlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
