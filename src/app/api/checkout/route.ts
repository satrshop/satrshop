import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from 'firebase-admin';

// In-memory rate limiting (basic protection for serverless functions)
const rateLimitCache = new Map<string, { count: number, resetTime: number }>();

export async function POST(req: Request) {
  try {
    // 1. Basic Rate Limiting
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    const rateLimit = rateLimitCache.get(ip);
    
    if (rateLimit && rateLimit.resetTime > now) {
      if (rateLimit.count >= 3) { // Max 3 orders per minute
        return NextResponse.json({ error: "لقد قمت بإنشاء عدة طلبات في وقت قصير. يرجى الانتظار دقيقة والمحاولة مرة أخرى." }, { status: 429 });
      }
      rateLimitCache.set(ip, { count: rateLimit.count + 1, resetTime: rateLimit.resetTime });
    } else {
      rateLimitCache.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    }

    const body = await req.json();
    const { items, customer, paymentMethod, shippingFee } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
    }

    if (!customer || !customer.name || !customer.phone || !customer.address || !customer.city) {
      return NextResponse.json({ error: "بيانات العميل غير مكتملة" }, { status: 400 });
    }

    // FIX-11: Strict field validation
    if (typeof customer.name !== "string" || customer.name.trim().length === 0 || customer.name.length > 100) {
      return NextResponse.json({ error: "اسم العميل غير صالح" }, { status: 400 });
    }
    if (typeof customer.phone !== "string" || !/^\d{7,15}$/.test(customer.phone.replace(/[\s\-+]/g, ""))) {
      return NextResponse.json({ error: "رقم الهاتف غير صالح" }, { status: 400 });
    }
    if (typeof customer.city !== "string" || customer.city.length > 100) {
      return NextResponse.json({ error: "اسم المدينة غير صالح" }, { status: 400 });
    }
    if (typeof customer.address !== "string" || customer.address.length > 500) {
      return NextResponse.json({ error: "العنوان غير صالح" }, { status: 400 });
    }
    if (customer.email && (typeof customer.email !== "string" || !customer.email.includes("@") || customer.email.length > 254)) {
      return NextResponse.json({ error: "البريد الإلكتروني غير صالح" }, { status: 400 });
    }
    if (items.length > 50) {
      return NextResponse.json({ error: "عدد العناصر يتجاوز الحد المسموح" }, { status: 400 });
    }
    for (const item of items) {
      if (!item.id || typeof item.id !== "string") {
        return NextResponse.json({ error: "عنصر غير صالح في السلة" }, { status: 400 });
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return NextResponse.json({ error: "كمية غير صالحة" }, { status: 400 });
      }
    }
    const validPaymentMethods = ["cod", "cliq"];
    if (paymentMethod && !validPaymentMethods.includes(paymentMethod)) {
      return NextResponse.json({ error: "طريقة دفع غير صالحة" }, { status: 400 });
    }

    // 2. Validate Prices and Stock using Firestore Transaction
    let realSubtotal = 0;
    const itemsWithCost: any[] = [];
    const insufficientItems: string[] = [];

    await adminDb.runTransaction(async (transaction) => {
      // First pass: Read all product documents to ensure consistency
      const productDocs = await Promise.all(
        items.map(async (item) => {
          const productRef = adminDb.collection("products").doc(item.id);
          const snap = await transaction.get(productRef);
          return { item, snap, productRef };
        })
      );

      // Validation phase
      productDocs.forEach(({ item, snap }) => {
        if (!snap.exists) {
          insufficientItems.push(item.name);
          return;
        }

        const productData = snap.data()!;
        
        // Quantity validation
        if (item.quantity <= 0 || !Number.isInteger(item.quantity)) {
          throw new Error("تلاعب بالكميات");
        }

        // Stock validation
        if ((productData.stock || 0) < item.quantity) {
          insufficientItems.push(`${item.name} (المتاح: ${productData.stock || 0})`);
          return;
        }

        // Calculate real subtotal using SERVER prices
        const realPrice = productData.price;
        realSubtotal += realPrice * item.quantity;

        itemsWithCost.push({
          id: item.id,
          name: productData.name,
          price: realPrice, // Force real price
          image: item.image, // Trust client image (or could fetch from DB)
          quantity: item.quantity,
          costPrice: productData.costPrice || 0,
          selectedColor: item.selectedColor || null,
          selectedSize: item.selectedSize || null
        });
      });

      if (insufficientItems.length > 0) {
        throw new Error(`INSUFFICIENT_STOCK:${insufficientItems.join("، ")}`);
      }

      // Write phase: Decrement stock
      productDocs.forEach(({ item, productRef }) => {
        transaction.update(productRef, {
          stock: admin.firestore.FieldValue.increment(-item.quantity)
        });
      });
    });

    // 3. Create the Order securely
    // Enforce Shipping Fee (2.50 or 0 for Zaytoonah) ignoring the client payload
    const finalShippingFee = customer.isZaytoonah ? 0 : 2.50;
    const realTotal = realSubtotal + finalShippingFee;

    const newOrder = {
      items: itemsWithCost,
      customer: {
        name: customer.name,
        phone: customer.phone,
        email: customer.email || "",
        city: customer.city,
        address: customer.address,
        isZaytoonah: !!customer.isZaytoonah,
        gender: customer.gender || null
      },
      total: realTotal,
      shippingFee: finalShippingFee,
      paymentMethod: paymentMethod || "cod",
      status: "pending",
      createdAt: admin.firestore.Timestamp.now(),
    };

    const docRef = await adminDb.collection("orders").add(newOrder);

    return NextResponse.json({ success: true, orderId: docRef.id });

  } catch (error: any) {
    console.error("Secure Checkout Error:", error?.message || error, error?.stack);
    
    if (error.message?.startsWith("INSUFFICIENT_STOCK:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    if (error.message === "تلاعب بالكميات") {
      return NextResponse.json({ error: "تم اكتشاف محاولة تلاعب بالكميات" }, { status: 400 });
    }

    // In dev mode, include the actual error for debugging
    const devError = process.env.NODE_ENV !== "production" ? ` (${error?.message || "unknown"})` : "";
    return NextResponse.json({ error: `فشل إنشاء الطلب بسبب خطأ داخلي${devError}` }, { status: 500 });
  }
}
