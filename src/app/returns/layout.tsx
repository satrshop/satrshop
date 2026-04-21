import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الاسترجاع والاستبدال",
  description: "سياسة الاسترجاع والاستبدال في متجر سطر. استرجاع خلال 7 أيام واستبدال خلال 14 يوماً. تسوق بثقة تامة مع ضمان رضا العملاء.",
  alternates: {
    canonical: "/returns",
  },
  openGraph: {
    title: "سياسة الاسترجاع والاستبدال | متجر سطر",
    description: "استرجاع خلال 7 أيام واستبدال خلال 14 يوماً. تسوق بثقة تامة.",
    url: "/returns",
    type: "website",
  },
};

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
