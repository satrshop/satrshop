import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { verifyAdmin, AdminAuthError, logAdminActivity } from "@/lib/api/admin-auth";

/**
 * GET /api/admin/coupons - List all coupons
 */
export async function GET(req: Request) {
  try {
    const adminUser = await verifyAdmin(req);

    const snapshot = await adminDb
      .collection("coupons")
      .orderBy("createdAt", "desc")
      .get();

    const coupons = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ coupons });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error fetching coupons:", error);
    return NextResponse.json({ error: "فشل تحميل أكواد الخصم" }, { status: 500 });
  }
}

/**
 * POST /api/admin/coupons - Create a new coupon
 */
export async function POST(req: Request) {
  try {
    const adminUser = await verifyAdmin(req);
    const body = await req.json();
    const { code, discountPercent, maxUses, expiresAt } = body;

    // Validation
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return NextResponse.json({ error: "كود الخصم مطلوب" }, { status: 400 });
    }

    if (!discountPercent || typeof discountPercent !== "number" || discountPercent < 1 || discountPercent > 100) {
      return NextResponse.json({ error: "نسبة الخصم يجب أن تكون بين 1 و 100" }, { status: 400 });
    }

    if (maxUses !== undefined && (typeof maxUses !== "number" || maxUses < 0)) {
      return NextResponse.json({ error: "عدد الاستخدامات غير صالح" }, { status: 400 });
    }

    // Check for duplicate code
    const normalizedCode = code.trim().toUpperCase();
    const existingDocs = await adminDb
      .collection("coupons")
      .where("code", "==", normalizedCode)
      .get();

    if (!existingDocs.empty) {
      return NextResponse.json({ error: "كود الخصم موجود مسبقاً" }, { status: 400 });
    }

    const couponData: Record<string, any> = {
      code: normalizedCode,
      discountPercent,
      maxUses: maxUses || 0, // 0 = unlimited
      usedCount: 0,
      isActive: true,
      createdAt: admin.firestore.Timestamp.now(),
    };

    if (expiresAt) {
      couponData.expiresAt = admin.firestore.Timestamp.fromDate(new Date(expiresAt));
    }

    const docRef = await adminDb.collection("coupons").add(couponData);

    await logAdminActivity(adminUser, "إنشاء كود خصم", `تم إنشاء كود خصم: ${normalizedCode} (${discountPercent}%)`);

    return NextResponse.json({ 
      success: true, 
      coupon: { id: docRef.id, ...couponData } 
    });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error creating coupon:", error);
    return NextResponse.json({ error: "فشل إنشاء كود الخصم" }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/coupons - Update coupon (toggle active, edit details)
 */
export async function PATCH(req: Request) {
  try {
    const adminUser = await verifyAdmin(req);
    const body = await req.json();
    const { id, isActive, discountPercent, maxUses, expiresAt } = body;

    if (!id) {
      return NextResponse.json({ error: "معرف الكود مطلوب" }, { status: 400 });
    }

    const docRef = adminDb.collection("coupons").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "كود الخصم غير موجود" }, { status: 404 });
    }

    const updateData: Record<string, any> = {};

    if (typeof isActive === "boolean") {
      updateData.isActive = isActive;
    }
    if (typeof discountPercent === "number" && discountPercent >= 1 && discountPercent <= 100) {
      updateData.discountPercent = discountPercent;
    }
    if (typeof maxUses === "number" && maxUses >= 0) {
      updateData.maxUses = maxUses;
    }
    if (expiresAt !== undefined) {
      updateData.expiresAt = expiresAt ? admin.firestore.Timestamp.fromDate(new Date(expiresAt)) : admin.firestore.FieldValue.delete();
    }

    await docRef.update(updateData);

    const action = typeof isActive === "boolean" 
      ? (isActive ? "تفعيل كود خصم" : "تعطيل كود خصم")
      : "تعديل كود خصم";

    await logAdminActivity(adminUser, action, `كود: ${doc.data()?.code}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error updating coupon:", error);
    return NextResponse.json({ error: "فشل تعديل كود الخصم" }, { status: 500 });
  }
}

/**
 * DELETE /api/admin/coupons - Delete a coupon
 */
export async function DELETE(req: Request) {
  try {
    const adminUser = await verifyAdmin(req);
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "معرف الكود مطلوب" }, { status: 400 });
    }

    const docRef = adminDb.collection("coupons").doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "كود الخصم غير موجود" }, { status: 404 });
    }

    const couponCode = doc.data()?.code;
    await docRef.delete();

    await logAdminActivity(adminUser, "حذف كود خصم", `تم حذف كود: ${couponCode}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Error deleting coupon:", error);
    return NextResponse.json({ error: "فشل حذف كود الخصم" }, { status: 500 });
  }
}
