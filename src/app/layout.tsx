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
  metadataBase: new URL("https://satrshop.vercel.app"),
  title: {
    default: "متجر سطر | Satr Shop - متجر المبرمجين الأول في الأردن",
    template: "%s | متجر سطر"
  },
  description: "المتجر العربي الأول لطلبة تكنولوجيا المعلومات والمبرمجين. هوديز، تيشرتات، وإكسسوارات مصممة خصيصاً لمجتمع البرمجة في الأردن. توصيل لجميع المحافظات.",
  keywords: ["متجر سطر", "ملابس مبرمجين", "هوديز برمجة", "تيشرتات مبرمجين", "Satr Shop", "Programmer Fashion", "Coding Apparel Jordan", "ملابس تقنية", "متجر أردني", "ملابس IT", "هوديز كود", "أزياء المبرمجين"],
  authors: [{ name: "Satr Shop Team" }],
  creator: "Satr Shop",
  publisher: "Satr Shop",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "متجر سطر | Satr Shop - أزياء المبرمجين",
    description: "المتجر الأول لطلبة تكنولوجيا المعلومات والمبرمجين في الأردن والعالم العربي. هوديز، تيشرتات، وإكسسوارات تقنية بجودة عالية.",
    url: "https://satrshop.vercel.app",
    siteName: "متجر سطر",
    locale: "ar_JO",
    type: "website",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "متجر سطر - المتجر التقني الأول للمبرمجين في الأردن",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "متجر سطر | Satr Shop",
    description: "الأزياء التقنية للمبرمجين والمطورين. توصيل لجميع محافظات الأردن.",
    images: ["/images/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "متجر سطر | Satr Shop",
      "url": "https://satrshop.vercel.app",
      "logo": "https://satrshop.vercel.app/images/SatrLogo.png",
      "description": "المتجر العربي الأول لطلبة تكنولوجيا المعلومات والمبرمجين. هوديز، تيشرتات، وإكسسوارات مصممة خصيصاً لمجتمع البرمجة.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+962798419463",
        "contactType": "customer service",
        "email": "satrshopp@gmail.com",
        "availableLanguage": ["Arabic", "English"]
      },
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "عمّان",
        "addressCountry": "JO"
      },
      "sameAs": [
        "https://www.instagram.com/satr.shopp/"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "متجر سطر",
      "alternateName": "Satr Shop",
      "url": "https://satrshop.vercel.app",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://satrshop.vercel.app/shop?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    }
  ];

  return (
    <html lang="ar" dir="rtl" className={`${madaFont.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
              `}
            </Script>
          </>
        )}
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
