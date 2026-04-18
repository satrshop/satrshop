"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const IconInstagram = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
);

const IconTwitter = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
);

const IconGithub = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

export default function Footer() {
  const pathname = usePathname();

  // Don't show footer on admin pages
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-primary pt-16 pb-8 relative z-10 block">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 sm:gap-12 mb-12">
        <div className="col-span-1">
          {/* Logo updated for dark/blue background (inverted visually if needed) */}
          <div className="bg-primary-foreground/90 p-3 rounded-2xl w-fit mb-6 flex gap-2">
            <Image src="/images/SatrLogo.png" alt="شعار سطر" width={90} height={30} className="object-contain dark:hidden block" />
            <Image src="/images/whitelogo.png" alt="شعار سطر" width={90} height={30} className="object-contain hidden dark:block" />
          </div>
          <p className="text-primary-foreground/90 text-sm leading-relaxed mb-6 font-medium">
            متجر سطر، وجهتك الأولى للأزياء التقنية. صُنع لطلبة تكنولوجيا المعلومات والمبرمجين الذين يقدرون الجودة وفخامة الكود.
          </p>
          <div className="flex gap-4">
            <a href="https://www.instagram.com/satr.shopp/" target="_blank" rel="noopener noreferrer" className="p-3 bg-primary-foreground/10 text-primary-foreground rounded-full hover:bg-secondary transition-colors shadow-sm"><IconInstagram /></a>
          </div>
        </div>

        <div className="md:text-center">
          <h4 className="font-bold text-primary-foreground mb-6 text-lg">روابط سريعة</h4>
          <ul className="space-y-4 text-sm text-primary-foreground/80 font-medium">
            <li><Link href="/" className="hover:text-secondary hover:translate-x-[-5px] inline-block transition-transform">الرئيسية</Link></li>
            <li><Link href="/shop" className="hover:text-secondary hover:translate-x-[-5px] inline-block transition-transform">المتجر</Link></li>
            <li><Link href="/contact" className="hover:text-secondary hover:translate-x-[-5px] inline-block transition-transform">تواصل معنا</Link></li>
          </ul>
        </div>

        <div className="md:text-left">
          <h4 className="font-bold text-primary-foreground mb-6 text-lg">الدعم والمساعدة</h4>
          <ul className="space-y-4 text-sm text-primary-foreground/80 font-medium">
            <li><Link href="/faq" className="hover:text-secondary hover:translate-x-[-5px] inline-block transition-transform">الأسئلة الشائعة</Link></li>
            <li><Link href="/shipping" className="hover:text-secondary hover:translate-x-[-5px] inline-block transition-transform">الشحن والتوصيل</Link></li>
            <li><Link href="/returns" className="hover:text-secondary hover:translate-x-[-5px] inline-block transition-transform">سياسة الاسترجاع</Link></li>
            <li><Link href="/size-guide" className="hover:text-secondary hover:translate-x-[-5px] inline-block transition-transform">دليل المقاسات</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/70 font-medium text-center md:text-right">
        <p>&copy; {new Date().getFullYear()} متجر سطر. جميع الحقوق محفوظة.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-secondary transition-colors">سياسة الخصوصية</Link>
          <Link href="/terms" className="hover:text-secondary transition-colors">الأحكام والشروط</Link>
        </div>
      </div>
    </footer>
  );
}
