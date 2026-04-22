import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, AdminAuthError } from "@/lib/api/admin-auth";

const ORDERS_COLLECTION = "orders";

/**
 * GET /api/admin/orders — List all orders (sorted by createdAt desc).
 */
export async function GET(req: Request) {
  try {
    await verifyAdmin(req);

    const snapshot = await adminDb
      .collection(ORDERS_COLLECTION)
      .orderBy("createdAt", "desc")
      .get();

    const orders = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
