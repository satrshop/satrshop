import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

/**
 * POST /api/coupons/validate - Validate a discount code (public route)
 * Returns the discount percentage if valid.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code } = body;

    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ valid: false, error: "يرجى إدخال كود الخصم" }, { status: 400 });
    }

    const normalizedCode = code.trim().toUpperCase();

    const snapshot = await adminDb
      .collection("coupons")
      .where("code", "==", normalizedCode)
      .where("isActive", "==", true)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ valid: false, error: "كود الخصم غير صالح" }, { status: 200 });
    }

    const couponDoc = snapshot.docs[0];
    const couponData = couponDoc.data();

    // Check expiration
    if (couponData.expiresAt) {
      const expiresAt = couponData.expiresAt.toDate();
      if (expiresAt < new Date()) {
        return NextResponse.json({ valid: false, error: "كود الخصم منتهي الصلاحية" }, { status: 200 });
      }
    }

    // Check usage limit
    if (couponData.maxUses > 0 && couponData.usedCount >= couponData.maxUses) {
      return NextResponse.json({ valid: false, error: "كود الخصم استُنفد بالكامل" }, { status: 200 });
    }

    return NextResponse.json({
      valid: true,
      discountPercent: couponData.discountPercent,
      code: couponData.code,
    });
  } catch (error: any) {
    console.error("Error validating coupon:", error);
    return NextResponse.json({ valid: false, error: "حدث خطأ أثناء التحقق من الكود" }, { status: 500 });
  }
}
