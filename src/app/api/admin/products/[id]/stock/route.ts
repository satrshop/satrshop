import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { verifyAdmin, AdminAuthError } from "@/lib/api/admin-auth";
import * as admin from "firebase-admin";

const PRODUCTS_COLLECTION = "products";

/**
 * PUT /api/admin/products/[id]/stock — Update stock for a product.
 */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await verifyAdmin(req);
    const { id } = await params;
    const body = await req.json();

    const { stock } = body;

    if (typeof stock !== "number" || stock < 0) {
      return NextResponse.json({ error: "Invalid stock value" }, { status: 400 });
    }

    const docRef = adminDb.collection(PRODUCTS_COLLECTION).doc(id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await docRef.update({ stock: Math.max(0, Math.round(stock)) });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
