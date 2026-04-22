import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import * as admin from "firebase-admin";
import { verifyAdmin, logAdminActivity, AdminAuthError } from "@/lib/api/admin-auth";

const ORDERS_COLLECTION = "orders";

/**
 * GET /api/admin/orders/[id] — Get a single order.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(req);
    const { id } = await params;

    const doc = await adminDb.collection(ORDERS_COLLECTION).doc(id).get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order: { id: doc.id, ...doc.data() } });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PUT /api/admin/orders/[id] — Update order status.
 * Handles stock adjustments when cancelling/uncancelling orders.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const verifiedAdmin = await verifyAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    const validStatuses = ["pending", "confirmed", "shipping", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const docRef = adminDb.collection(ORDERS_COLLECTION).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const orderData = doc.data()!;
    const currentStatus = orderData.status;

    // Stock adjustments on cancel/uncancel
    if (status === "cancelled" && currentStatus !== "cancelled") {
      // Return stock
      const batch = adminDb.batch();
      for (const item of orderData.items) {
        const productRef = adminDb.collection("products").doc(item.id);
        batch.update(productRef, {
          stock: admin.firestore.FieldValue.increment(item.quantity),
        });
      }
      await batch.commit();
    } else if (currentStatus === "cancelled" && status !== "cancelled") {
      // Re-deduct stock
      const batch = adminDb.batch();
      for (const item of orderData.items) {
        const productRef = adminDb.collection("products").doc(item.id);
        batch.update(productRef, {
          stock: admin.firestore.FieldValue.increment(-item.quantity),
        });
      }
      await batch.commit();
    }

    await docRef.update({ status });

    const statusArabic: Record<string, string> = {
      pending: "قيد الانتظار",
      confirmed: "تم التأكيد",
      shipping: "جاري الشحن",
      completed: "تم التوصيل",
      cancelled: "ملغي",
    };
    await logAdminActivity(
      verifiedAdmin,
      "تحديث حالة طلب",
      `تم تحديث حالة الطلب ${id} إلى: ${statusArabic[status] || status}`
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
