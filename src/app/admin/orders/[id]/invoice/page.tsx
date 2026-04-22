"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Order } from "@/types/models/order";
import { adminFetch } from "@/lib/api/admin-client";
import { Loader2, Printer, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function InvoicePage() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (typeof id !== "string") return;
      try {
        const data = await adminFetch<{ order: Order }>(`/api/admin/orders/${id}`);
        setOrder(data.order);
        if (data.order) {
          document.title = `Invoice-${data.order.id.slice(0, 8).toUpperCase()}`;
        }
      } catch (err) {
        console.error("Failed to load order:", err);
      }
      setLoading(false);
    }
    loadOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-secondary animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">الطلب غير موجود</h1>
        <Link href="/admin/orders" className="text-secondary hover:underline">
          العودة للطلبات
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 print:bg-white print:py-0">
      {/* Controls - Hidden on Print */}
      <div className="max-w-4xl mx-auto mb-8 flex justify-between items-center px-4 print:hidden">
        <Link href="/admin/orders" className="flex items-center gap-2 text-primary/60 hover:text-primary transition-colors font-bold">
          <ArrowRight size={20} />
          العودة للطلبات
        </Link>
        <button 
          onClick={() => window.print()}
          className="bg-secondary text-primary px-6 py-3 rounded-xl font-black flex items-center gap-2 hover:bg-secondary/90 transition-all shadow-lg"
        >
          <Printer size={20} />
          بدء الطباعة
        </button>
      </div>

      {/* Invoice Content */}
      <div className="invoice-container max-w-[210mm] mx-auto bg-white shadow-2xl print:shadow-none p-[10mm] sm:p-[15mm] flex flex-col text-right font-sans" dir="rtl">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-secondary pb-10 mb-10">
          <div>
            <div className="mb-4 relative w-[150px] h-[40px] grayscale brightness-0 opacity-80">
                <Image src="/images/whitelogo.png" alt="Logo" fill className="object-contain" />
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">فاتورة شراء</h1>
            <p className="text-gray-500 font-bold">متجر سطر - الأردن</p>
          </div>
          <div className="text-left">
            <div className="mb-4">
              <span className="text-gray-400 text-[10px] uppercase font-black block">رقم الفاتورة</span>
              <span className="text-xl font-mono font-bold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</span>
            </div>
            <div>
              <span className="text-gray-400 text-[10px] uppercase font-black block">تاريخ الطلب</span>
              <span className="text-lg font-bold text-gray-900">
                {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("ar-EG") : "---"}
              </span>
            </div>
          </div>
        </div>

        {/* Customer & Store Info */}
        <div className="grid grid-cols-2 gap-10 mb-12">
          <div className="bg-gray-50 p-6 rounded-2xl">
            <h3 className="text-secondary font-black text-[10px] uppercase tracking-widest mb-4">مرسل إلى</h3>
            <div className="space-y-1">
              <p className="text-xl font-black text-gray-900">{order.customer.name}</p>
              <p className="text-gray-600 font-bold">{order.customer.phone}</p>
              <p className="text-gray-600 font-bold">{order.customer.city}</p>
              <p className="text-gray-600 text-sm leading-relaxed">{order.customer.address}</p>
            </div>
          </div>
          <div className="p-6">
            <h3 className="text-secondary font-black text-[10px] uppercase tracking-widest mb-4">من قِبل</h3>
            <div className="space-y-1">
              <p className="text-xl font-black text-gray-900">متجر سطر (Satr Shop)</p>
              <p className="text-gray-600 font-bold">عمان، الأردن</p>
              <p className="text-gray-600 text-sm">متخصصون في الملابس العصرية</p>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-12">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-900 text-white text-right">
                <th className="p-4 font-bold text-sm">المنتج</th>
                <th className="p-4 font-bold text-sm text-center">الكمية</th>
                <th className="p-4 font-bold text-sm text-left">السعر</th>
                <th className="p-4 font-bold text-sm text-left">المجموع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-50">
                  <td className="p-4">
                    <p className="font-bold text-gray-900">{item.name}</p>
                    <div className="flex gap-2 mt-1">
                      {(item as { selectedSize?: string }).selectedSize && (
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">المقاس: {(item as { selectedSize?: string }).selectedSize}</span>
                      )}
                      {(item as { selectedColor?: { name: string } }).selectedColor && (
                        <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold">اللون: {(item as { selectedColor?: { name: string } }).selectedColor?.name}</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-center font-bold text-gray-700">{item.quantity}</td>
                  <td className="p-4 text-left font-bold text-gray-700">{item.price.toFixed(2)} د.ا</td>
                  <td className="p-4 text-left font-black text-gray-900">{(item.price * item.quantity).toFixed(2)} د.ا</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-start">
          <div className="w-full max-w-[300px] space-y-4">
            <div className="flex justify-between items-center text-gray-500 font-bold">
              <span>المجموع الفرعي</span>
              <span>{(order.total - order.shippingFee).toFixed(2)} د.ا</span>
            </div>
            <div className="flex justify-between items-center text-gray-500 font-bold">
              <span>رسوم التوصيل</span>
              <span>{order.shippingFee.toFixed(2)} د.ا</span>
            </div>
            <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-xl border border-secondary/20">
              <span className="text-secondary font-black text-lg">الإجمالي النهائي</span>
              <span className="text-secondary font-black text-2xl">{order.total.toFixed(2)} د.ا</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-10 border-t border-gray-100 flex justify-between items-end">
          <div className="text-right">
            <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] mb-4">شكراً لشرائكم من متجر سطر</p>
            <div className="flex flex-wrap gap-x-10 gap-y-2 text-[10px] font-bold text-gray-300">
              <span>في حال وجود أي استفسار يرجى التواصل عبر الواتساب</span>
              <span>هذه فاتورة إلكترونية لا تحتاج لختم</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
             <span className="text-[8px] font-black text-gray-300 uppercase tracking-widest">تابعنا على إنستغرام</span>
             <div className="w-20 h-20 relative bg-white p-1 border border-gray-100 rounded-lg">
                <Image src="/images/insta-qr.png" alt="Instagram QR" fill className="object-contain" />
             </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          @page {
            margin: 5mm;
            size: A4;
          }
          .print-hidden {
            display: none !important;
          }
          /* Reduce vertical spacing for single page fit */
          .mb-10, .mb-12 {
            margin-bottom: 1.5rem !important;
          }
          .pb-10 {
            padding-bottom: 1rem !important;
          }
          .py-10 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          /* Ensure footer doesn't jump to next page unless necessary */
          .mt-auto {
            margin-top: 2rem !important;
          }
          table th, table td {
            padding: 8px !important;
          }
          .max-w-[210mm] {
            box-shadow: none !important;
            width: 100% !important;
            padding: 0 !important;
          }
          /* Scale down slightly if needed */
          .invoice-container {
            transform: scale(0.98);
            transform-origin: top center;
          }
        }
      `}</style>
    </div>
  );
}
