import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import CartDrawer from "@/components/cart/CartDrawer";
import Footer from "@/components/layout/Footer";
import Script from "next/script";

const madaFont = localFont({
  src: "../../public/fonts/SFMADA.ttf",
  variable: "--font-mada",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "متجر سطر | Satr Shop - متجر المبرمجين الأول",
    template: "%s | متجر سطر"
  },
  description: "المتجر العربي الأول لطلبة تكنولوجيا المعلومات والمبرمجين. هوديز، تيشرتات، وإكسسوارات مصممة خصيصاً لمجتمع البرمجة في الأردن.",
  keywords: ["متجر سطر", "ملابس مبرمجين", "هوديز برمجة", "تيشرتات مبرمجين", "Satr Shop", "Programmer Fashion", "Coding Apparel Jordan"],
  authors: [{ name: "Satr Shop Team" }],
  creator: "Satr Shop",
  publisher: "Satr Shop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "متجر سطر | Satr Shop",
    description: "المتجر الأول لطلبة تكنولوجيا المعلومات والمبرمجين في الأردن والعالم العربي.",
    url: "https://satrshop-8ad70.web.app",
    siteName: "متجر سطر",
    locale: "ar_JO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "متجر سطر | Satr Shop",
    description: "الأزياء التقنية للمبرمجين والمطورين.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "متجر سطر | Satr Shop",
    "url": "https://satrshop-8ad70.web.app",
    "logo": "https://satrshop-8ad70.web.app/images/SatrLogo.png",
    "description": "المتجر العربي الأول لطلبة تكنولوجيا المعلومات والمبرمجين. هوديز، تيشرتات، وإكسسوارات مصممة خصيصاً لمجتمع البرمجة.",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "JO"
    },
    "sameAs": [
      "https://www.instagram.com/satr.shopp/"
    ]
  };

  return (
    <html lang="ar" dir="rtl" className={`${madaFont.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <CartDrawer />
          <div className="flex-1">
            {children}
          </div>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
